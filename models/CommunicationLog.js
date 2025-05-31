const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  message: String,
  status: { type: String, enum: ["SENT", "FAILED"], default: "SENT" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CommunicationLog", logSchema);
