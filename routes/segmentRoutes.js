const express = require("express");
const router = express.Router();
const Segment = require("../models/Segment");
const Customer = require("../models/Customer");
const authMiddleware = require("../middleware/authMiddleware");
const { createSegment, getSegments, deleteSegment } = require("../controllers/segmentController");

router.use(authMiddleware); // ✅ protect all segment routes

// Create a new segment
router.post("/", async (req, res) => {
  try {
    console.log("Creating segment for user:", req.user.sub);
    console.log("Segment data:", req.body);

    const segment = await Segment.create({
      ...req.body,
      userId: req.user.sub, // ✅ scope to logged-in user
    });

    console.log("Created segment:", segment);
    res.status(201).json(segment);
  } catch (err) {
    console.error("Failed to create segment:", err);
    res.status(500).json({ 
      error: "Failed to create segment.",
      details: err.message 
    });
  }
});

// Get all segments for the user
router.get("/", async (req, res) => {
  try {
    console.log("Fetching segments for user:", req.user.sub);
    
    const segments = await Segment.find({ userId: req.user.sub });
    console.log("Found segments:", segments);
    
    res.json(segments);
  } catch (err) {
    console.error("Failed to fetch segments:", err);
    res.status(500).json({ 
      error: "Failed to fetch segments.",
      details: err.message 
    });
  }
});

// Preview matching customers
router.post("/preview", async (req, res) => {
  try {
    console.log("Previewing segment for user:", req.user.sub);
    console.log("Preview rules:", req.body.rules);

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

    console.log("Customer query:", query);
    const customers = await Customer.find(query).limit(5);
    console.log("Found customers:", customers.length);

    res.json({ count: customers.length, sample: customers });
  } catch (err) {
    console.error("Failed to preview segment:", err);
    res.status(500).json({ 
      error: "Failed to preview segment.",
      details: err.message 
    });
  }
});

// Delete a segment by ID
router.delete("/:id", authMiddleware, deleteSegment);

module.exports = router;
