const Campaign = require("../models/Campaign");
const Segment = require("../models/Segment");
const Customer = require("../models/Customer");
const CommunicationLog = require("../models/CommunicationLog"); 
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); 

const createCampaign = async (req, res) => {
  try {
    const { name, segmentId, message } = req.body;
    const userId = req.user.sub;

    const segment = await Segment.findOne({ _id: segmentId, userId });
    if (!segment) return res.status(404).json({ error: "Segment not found" });

    const query = { userId };
    for (const rule of segment.rules) {
      if (rule.field && rule.operator && rule.value !== undefined) {
        if (rule.operator === "gt") query[rule.field] = { $gt: rule.value };
        else if (rule.operator === "lt") query[rule.field] = { $lt: rule.value };
        else query[rule.field] = rule.value;
      }
    }

    const audience = await Customer.find(query);
    let sent = 0, failed = 0;

    const campaign = await Campaign.create({
      userId,
      name,
      segmentId,
      message,
      sent: 0,
      failed: 0,
    });

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
        failed++;
        await CommunicationLog.create({
          campaignId: campaign._id,
          customerId: cust._id,
          message: `Hi ${cust.name}, ${message}`,
          status: "FAILED",
        });
      }
    }

    campaign.sent = sent;
    campaign.failed = failed;
    await campaign.save();

    res.status(201).json(campaign);
  } catch (err) {
    console.error("❌ Campaign error:", err);
    res.status(500).json({ error: "Failed to launch campaign" });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.sub }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error("❌ Error fetching campaigns:", err);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
};

module.exports = { createCampaign, getCampaigns };
