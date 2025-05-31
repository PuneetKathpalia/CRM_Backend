const mongoose = require("mongoose");

const segmentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  name: { type: String, required: true },
  rules: [Object],
});

module.exports = mongoose.model("Segment", segmentSchema);
