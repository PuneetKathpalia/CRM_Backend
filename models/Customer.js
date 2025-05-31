const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  totalSpend: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  tags: [String],
});

module.exports = mongoose.model("Customer", customerSchema);
