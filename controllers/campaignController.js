const Campaign = require("../models/Campaign");
const Segment = require("../models/Segment");
const Customer = require("../models/Customer");
const CommunicationLog = require("../models/CommunicationLog");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const createCampaign = async (req, res) => {
  try {
    console.log("Creating campaign with data:", req.body);
    const { name, segmentId, message } = req.body;
    const userId = req.user.sub;

    // Validate required fields
    if (!name || !segmentId || !message) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "Name, segment ID, and message are required"
      });
    }

    // Find the segment
    const segment = await Segment.findOne({ _id: segmentId, userId });
    if (!segment) {
      console.error("Segment not found:", { segmentId, userId });
      return res.status(404).json({ error: "Segment not found" });
    }

    console.log("Found segment:", segment);

    // Build query based on segment rules
    const query = { userId };
    const { rules } = segment;

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

    // Find matching customers
    const audience = await Customer.find(query);
    console.log("Found audience size:", audience.length);

    // Create the campaign
    const campaign = await Campaign.create({
      userId,
      name,
      segmentId,
      message,
      sent: 0,
      failed: 0,
    });

    console.log("Created campaign:", campaign);

    let sent = 0, failed = 0;

    // Process each customer
    for (const cust of audience) {
      try {
        const result = await fetch("http://localhost:8000/api/vendor/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: campaign._id,
            customerId: cust._id,
            message: `Hi ${cust.name}, ${message}`,
          }),
        });

        const data = await result.json();
        const status = data.status === "SENT" ? "SENT" : "FAILED";

        await CommunicationLog.create({
          userId,
          campaignId: campaign._id,
          customerId: cust._id,
          message: `Hi ${cust.name}, ${message}`,
          status,
        });

        status === "SENT" ? sent++ : failed++;
      } catch (err) {
        console.error("Failed to send message to customer:", cust._id, err);
        failed++;
        await CommunicationLog.create({
          userId,
          campaignId: campaign._id,
          customerId: cust._id,
          message: `Hi ${cust.name}, ${message}`,
          status: "FAILED",
        });
      }
    }

    // Update campaign with final stats
    campaign.sent = sent;
    campaign.failed = failed;
    await campaign.save();

    console.log("Campaign completed:", { sent, failed });
    res.status(201).json(campaign);
  } catch (err) {
    console.error("Campaign creation failed:", err);
    res.status(500).json({ 
      error: "Failed to launch campaign",
      details: err.message
    });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.sub })
      .populate('segmentId')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    res.status(500).json({ 
      error: "Failed to fetch campaigns",
      details: err.message
    });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Delete associated communication logs
    await CommunicationLog.deleteMany({ campaignId: id });

    // Delete the campaign
    await Campaign.deleteOne({ _id: id });

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("Error deleting campaign:", err);
    res.status(500).json({ 
      error: "Failed to delete campaign",
      details: err.message
    });
  }
};

module.exports = { createCampaign, getCampaigns, deleteCampaign };
