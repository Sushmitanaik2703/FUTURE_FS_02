const Lead = require("../models/Lead");
const LeadActivity = require("../models/LeadActivity");

// Public contact form submission
const publicSubmit = async (req, res) => {
  try {
    const {
      name,
      email,
      phone = "",
      company = "",
      message = "",
      source = "Website Form",
    } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      message,
      source,
      status: "NEW",
    });

    await LeadActivity.create({
      leadId: lead._id,
      type: "created",
      details: "Lead created through public contact form",
    });

    res.status(201).json({
      message: "Lead submitted successfully",
      lead,
    });
  } catch (error) {
    console.error("Public lead submission error:", error);

    res.status(500).json({
      message: "Failed to submit lead",
    });
  }
};

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      source = "",
    } = req.query;

    const filter = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: regex },
        { email: regex },
        { company: regex },
        { message: regex },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (source) {
      filter.source = source;
    }

    const leads = await Lead.find(filter).sort({
      createdAt: -1,
    });

    res.json(leads);
  } catch (error) {
    console.error("Get leads error:", error);

    res.status(500).json({
      message: "Failed to fetch leads",
    });
  }
};

// Get single lead with activity timeline
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    const activities = await LeadActivity.find({
      leadId: lead._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      lead,
      activities,
    });
  } catch (error) {
    console.error("Get lead error:", error);

    res.status(500).json({
      message: "Failed to fetch lead",
    });
  }
};

// Create lead manually
const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone = "",
      company = "",
      source = "Manual",
      status = "NEW",
      message = "",
    } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source,
      status,
      message,
    });

    await LeadActivity.create({
      leadId: lead._id,
      type: "created",
      details: "Lead created manually by admin",
    });

    res.status(201).json({
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    res.status(500).json({
      message: "Failed to create lead",
    });
  }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    const oldStatus = lead.status;

    lead.status = status;
    await lead.save();

    await LeadActivity.create({
      leadId: lead._id,
      type: "status",
      details: `Status changed from ${oldStatus} to ${status}`,
    });

    res.json({
      message: "Lead status updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
      message: "Failed to update lead status",
    });
  }
};

// Add follow-up note
const addLeadNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    await LeadActivity.create({
      leadId: lead._id,
      type: "note",
      note,
      details: "Follow-up note added",
    });

    lead.updatedAt = new Date();
    await lead.save();

    res.json({
      message: "Follow-up note added successfully",
    });
  } catch (error) {
    console.error("Add note error:", error);

    res.status(500).json({
      message: "Failed to add follow-up note",
    });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    await LeadActivity.deleteMany({
      leadId: lead._id,
    });

    await Lead.findByIdAndDelete(id);

    res.json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    res.status(500).json({
      message: "Failed to delete lead",
    });
  }
};

// Analytics
const getAnalytics = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();

    const statusResults = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const sourceResults = await Lead.aggregate([
      {
        $group: {
          _id: "$source",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const statusCounts = {};

    statusResults.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    const converted = statusCounts.CONVERTED || 0;

    const conversionRate =
      totalLeads > 0
        ? Number(((converted / totalLeads) * 100).toFixed(2))
        : 0;

    res.json({
      totalLeads,
      statusCounts,
      conversionRate,
      sourceBreakdown: sourceResults.map((item) => ({
        source: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);

    res.status(500).json({
      message: "Failed to fetch analytics",
    });
  }
};

// Export leads as CSV
const exportLeadsCSV = async (req, res) => {
  try {
    const leads = await Lead.find().sort({
      createdAt: -1,
    });

    const header =
      "Name,Email,Phone,Company,Source,Status,Message,Created At,Updated At";

    const rows = leads.map((lead) => {
      const escapeCSV = (value) => {
        const stringValue = value == null ? "" : String(value);

        return `"${stringValue.replace(/"/g, '""')}"`;
      };

      return [
        escapeCSV(lead.name),
        escapeCSV(lead.email),
        escapeCSV(lead.phone),
        escapeCSV(lead.company),
        escapeCSV(lead.source),
        escapeCSV(lead.status),
        escapeCSV(lead.message),
        escapeCSV(lead.createdAt),
        escapeCSV(lead.updatedAt),
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=leads.csv"
    );

    res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);

    res.status(500).json({
      message: "Failed to export leads",
    });
  }
};

module.exports = {
  publicSubmit,
  getAllLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  addLeadNote,
  deleteLead,
  getAnalytics,
  exportLeadsCSV,
};