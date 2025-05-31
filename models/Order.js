const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  amount: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
