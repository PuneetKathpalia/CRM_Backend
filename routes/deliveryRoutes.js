const express = require("express");
const router = express.Router();
const CommunicationLog = require("../models/CommunicationLog");

router.post("/receipt", async (req, res) => {
  const { campaignId, customerId, status } = req.body;

  try {
    await CommunicationLog.create({
      campaignId,
      customerId,
      status,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error saving delivery receipt:", err);
    res.status(500).json({ error: "Failed to save receipt" });
  }
});

module.exports = router;
