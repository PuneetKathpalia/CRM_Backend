const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();

router.post("/send", async (req, res) => {
  const { campaignId, customerId, message } = req.body;

  const isSent = Math.random() < 0.9; // 90% success
  const status = isSent ? "SENT" : "FAILED";

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Hit Delivery Receipt API
  await fetch("http://localhost:8000/api/delivery/receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaignId, customerId, status }),
  });

  res.json({ status });
});

module.exports = router;
