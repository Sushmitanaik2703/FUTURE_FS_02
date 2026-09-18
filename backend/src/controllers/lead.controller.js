const { dbAsync } = require('../config/database');

// Public lead submission from website contact form
const publicSubmit = async (req, res) => {
  try {
    const { name, email, phone, company, message, source } = req.body;
    const leadSource = source || 'Website Form';

    const result = await dbAsync.run(
      `INSERT INTO leads (name, email, phone, company, source, status, message)
       VALUES (?, ?, ?, ?, ?, 'NEW', ?)`,
      [name.trim(), email.trim(), phone ? phone.trim() : null, company ? company.trim() : null, leadSource, message.trim()]
    );

    const leadId = result.lastID;

    // Record initial activity event
    await dbAsync.run(
      `INSERT INTO lead_activities (lead_id, activity_type, description, created_by)
       VALUES (?, 'CREATED', ?, 'Website Visitor')`,
      [leadId, `Lead submitted via ${leadSource}: "${message.trim()}"`]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. We will contact you shortly.',
      leadId
    });
  } catch (error) {
    console.error('Public lead submission error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process lead submission.' });
  }
};

// Admin: Get all leads with search & filtering
const getAllLeads = async (req, res) => {
  try {
    const { search, status, source } = req.query;

    let sql = `SELECT * FROM leads WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR company LIKE ? OR message LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'ALL') {
      sql += ` AND status = ?`;
      params.push(status.toUpperCase());
    }

    if (source && source !== 'ALL') {
      sql += ` AND source = ?`;
      params.push(source);
    }

    sql += ` ORDER BY created_at DESC`;

    const leads = await dbAsync.all(sql, params);
    return res.json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch leads.' });
  }
};

// Admin: Get single lead by ID with activity timeline history
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await dbAsync.get(`SELECT * FROM leads WHERE id = ?`, [id]);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    const activities = await dbAsync.all(
      `SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      lead,
      activities
    });
  } catch (error) {
    console.error('Error fetching lead details:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch lead details.' });
  }
};

// Admin: Create new lead manually
const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, message } = req.body;
    const initialStatus = (status || 'NEW').toUpperCase();
    const leadSource = source || 'Manual Entry';

    const result = await dbAsync.run(
      `INSERT INTO leads (name, email, phone, company, source, status, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone ? phone.trim() : null, company ? company.trim() : null, leadSource, initialStatus, message ? message.trim() : '']
    );

    const leadId = result.lastID;
    const author = req.user ? req.user.name : 'Admin';

    await dbAsync.run(
      `INSERT INTO lead_activities (lead_id, activity_type, description, created_by)
       VALUES (?, 'CREATED', ?, ?)`,
      [leadId, `Lead manually created by ${author}`, author]
    );

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      leadId
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({ success: false, error: 'Failed to create lead.' });
  }
};

// Admin: Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await dbAsync.get(`SELECT status FROM leads WHERE id = ?`, [id]);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    const oldStatus = lead.status;
    const newStatus = status.toUpperCase();

    if (oldStatus === newStatus) {
      return res.json({ success: true, message: 'Status is unchanged.', lead });
    }

    await dbAsync.run(
      `UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStatus, id]
    );

    const author = req.user ? req.user.name : 'Admin';

    // Log status change activity
    await dbAsync.run(
      `INSERT INTO lead_activities (lead_id, activity_type, description, created_by)
       VALUES (?, 'STATUS_CHANGE', ?, ?)`,
      [id, `Status updated: ${oldStatus} → ${newStatus}`, author]
    );

    const updatedLead = await dbAsync.get(`SELECT * FROM leads WHERE id = ?`, [id]);

    return res.json({
      success: true,
      message: `Status updated to ${newStatus}`,
      lead: updatedLead
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    return res.status(500).json({ success: false, error: 'Failed to update lead status.' });
  }
};

// Admin: Add follow-up note activity
const addLeadNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const lead = await dbAsync.get(`SELECT id FROM leads WHERE id = ?`, [id]);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    const author = req.user ? req.user.name : 'Admin';

    await dbAsync.run(
      `INSERT INTO lead_activities (lead_id, activity_type, description, created_by)
       VALUES (?, 'NOTE_ADDED', ?, ?)`,
      [id, note.trim(), author]
    );

    // Touch lead updated_at
    await dbAsync.run(`UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);

    const activities = await dbAsync.all(
      `SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Follow-up note added successfully',
      activities
    });
  } catch (error) {
    console.error('Error adding follow-up note:', error);
    return res.status(500).json({ success: false, error: 'Failed to add follow-up note.' });
  }
};

// Admin: Delete lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await dbAsync.get(`SELECT id, name FROM leads WHERE id = ?`, [id]);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    // Delete associated activities first
    await dbAsync.run(`DELETE FROM lead_activities WHERE lead_id = ?`, [id]);
    // Delete lead
    await dbAsync.run(`DELETE FROM leads WHERE id = ?`, [id]);

    return res.json({
      success: true,
      message: `Lead "${lead.name}" and associated records deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete lead.' });
  }
};

// Admin: Get Analytics Overview
const getAnalytics = async (req, res) => {
  try {
    const totalRow = await dbAsync.get(`SELECT COUNT(*) as count FROM leads`);
    const statusRows = await dbAsync.all(`SELECT status, COUNT(*) as count FROM leads GROUP BY status`);
    const sourceRows = await dbAsync.all(`SELECT source, COUNT(*) as count FROM leads GROUP BY source`);

    const statusCounts = {
      NEW: 0,
      CONTACTED: 0,
      IN_PROGRESS: 0,
      CONVERTED: 0,
      LOST: 0
    };

    statusRows.forEach(row => {
      statusCounts[row.status] = row.count;
    });

    const totalLeads = totalRow.count || 0;
    const conversionRate = totalLeads > 0 ? ((statusCounts.CONVERTED / totalLeads) * 100).toFixed(1) : 0;

    return res.json({
      success: true,
      analytics: {
        totalLeads,
        statusCounts,
        conversionRate: parseFloat(conversionRate),
        sourceBreakdown: sourceRows
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate analytics.' });
  }
};

// Admin: Export Leads to CSV
const exportLeadsCSV = async (req, res) => {
  try {
    const leads = await dbAsync.all(`SELECT * FROM leads ORDER BY created_at DESC`);

    let csv = 'ID,Name,Email,Phone,Company,Source,Status,Created At,Message\n';

    leads.forEach(lead => {
      const cleanName = `"${(lead.name || '').replace(/"/g, '""')}"`;
      const cleanEmail = `"${(lead.email || '').replace(/"/g, '""')}"`;
      const cleanPhone = `"${(lead.phone || '').replace(/"/g, '""')}"`;
      const cleanCompany = `"${(lead.company || '').replace(/"/g, '""')}"`;
      const cleanSource = `"${(lead.source || '').replace(/"/g, '""')}"`;
      const cleanStatus = `"${(lead.status || '').replace(/"/g, '""')}"`;
      const cleanCreatedAt = `"${(lead.created_at || '').replace(/"/g, '""')}"`;
      const cleanMessage = `"${(lead.message || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`;

      csv += `${lead.id},${cleanName},${cleanEmail},${cleanPhone},${cleanCompany},${cleanSource},${cleanStatus},${cleanCreatedAt},${cleanMessage}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    return res.status(500).json({ success: false, error: 'Failed to export leads.' });
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
  exportLeadsCSV
};
