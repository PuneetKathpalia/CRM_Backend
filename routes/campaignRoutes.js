const express = require("express");
const router = express.Router();
const { createCampaign, getCampaigns } = require("../controllers/campaignController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware); // ✅ protect all campaign routes

router.post("/", createCampaign);
router.get("/", getCampaigns); // ✅ if not added yet

module.exports = router;
