const mongoose = require("mongoose");

const leadActivitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    type: {
      type: String,
      enum: ["created", "status", "note"],
      required: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    details: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LeadActivity", leadActivitySchema);