const Segment = require("../models/Segment");

const createSegment = async (req, res) => {
  try {
    const { name, rules } = req.body;

    const segment = await Segment.create({
      userId: req.user.sub,
      name,
      rules,
    });

    res.status(201).json(segment);
  } catch (err) {
    console.error("❌ Segment creation failed:", err);
    res.status(500).json({ message: "Failed to create segment" });
  }
};

const getSegments = async (req, res) => {
  try {
    const segments = await Segment.find({ userId: req.user.sub });
    res.json(segments);
  } catch (err) {
    console.error("❌ Error fetching segments:", err);
    res.status(500).json({ message: "Failed to fetch segments" });
  }
};

module.exports = { createSegment, getSegments };
