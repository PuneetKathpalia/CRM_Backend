const express = require("express");
const router = express.Router();

router.post("/verify", (req, res) => {
  const { token } = req.body;
  // For now, assume it's valid
  res.json({ verified: true, user: { email: "yourname@gmail.com" } });
});

module.exports = router;
