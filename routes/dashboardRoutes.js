const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Segment = require("../models/Segment");
const Campaign = require("../models/Campaign");
const CommunicationLog = require("../models/CommunicationLog");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/dashboard (scoped to user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;

    const [customers, segments, campaigns, sent, failed] = await Promise.all([
      Customer.countDocuments({ userId }),
      Segment.countDocuments({ userId }),
      Campaign.countDocuments({ userId }),
      CommunicationLog.countDocuments({ userId, status: "SENT" }),
      CommunicationLog.countDocuments({ userId, status: "FAILED" }),
    ]);

    res.json({
      customers,
      segments,
      campaigns,
      messagesSent: sent,
      messagesFailed: failed,
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ error: "Dashboard metrics failed." });
  }
});

module.exports = router;
