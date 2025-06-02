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

const deleteSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    console.log(`Attempting to delete segment with ID: ${id} for user: ${userId}`);

    let segment;
    try {
      segment = await Segment.findOneAndDelete({ _id: id, userId });
    } catch (dbError) {
      console.error(`❌ Database error while deleting segment with ID ${id}:`, dbError);
      return res.status(500).json({ message: "Database error while deleting segment" });
    }

    if (!segment) {
      console.log(`Segment not found or not authorized for deletion: ID ${id}, User ${userId}`);
      return res.status(404).json({ message: "Segment not found or not authorized" });
    }

    console.log(`Successfully deleted segment with ID: ${id}`);
    res.json({ message: "Segment deleted successfully" });
  } catch (err) {
    console.error(`❌ Error deleting segment with ID ${req.params.id} for user ${req.user.sub}:`, err);
    res.status(500).json({ message: "Failed to delete segment" });
  }
};

module.exports = { createSegment, getSegments, deleteSegment };
