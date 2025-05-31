const express = require("express");
const router = express.Router();
const Segment = require("../models/Segment");
const Customer = require("../models/Customer");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware); // ✅ protect all segment routes

// Create a new segment
router.post("/", async (req, res) => {
  try {
    const segment = await Segment.create({
      ...req.body,
      userId: req.user.sub, // ✅ scope to logged-in user
    });
    res.status(201).json(segment);
  } catch (err) {
    res.status(500).json({ error: "Failed to create segment." });
  }
});

// Get all segments for the user
router.get("/", async (req, res) => {
  try {
    const segments = await Segment.find({ userId: req.user.sub });
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch segments." });
  }
});

// Preview matching customers
router.post("/preview", async (req, res) => {
  try {
    const { rules } = req.body;
    const query = { userId: req.user.sub }; // ✅ limit to current user

    if (rules.totalSpend) {
      query.totalSpend = { [`$${rules.totalSpend.operator}`]: rules.totalSpend.value };
    }
    if (rules.visits) {
      query.visits = { [`$${rules.visits.operator}`]: rules.visits.value };
    }
    if (rules.inactiveDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - rules.inactiveDays);
      query.lastActive = { $lt: cutoff };
    }

    const customers = await Customer.find(query).limit(5);
    res.json({ count: customers.length, sample: customers });
  } catch (err) {
    res.status(500).json({ error: "Failed to preview segment." });
  }
});

module.exports = router;
