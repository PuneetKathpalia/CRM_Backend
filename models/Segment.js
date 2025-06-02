const mongoose = require("mongoose");

const segmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  rules: {
    totalSpend: {
      operator: { type: String, enum: ['gt', 'lt', 'eq'] },
      value: { type: Number }
    },
    visits: {
      operator: { type: String, enum: ['gt', 'lt', 'eq'] },
      value: { type: Number }
    },
    inactiveDays: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model("Segment", segmentSchema);
