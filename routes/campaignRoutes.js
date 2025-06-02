const express = require("express");
const router = express.Router();
const { createCampaign, getCampaigns, deleteCampaign } = require("../controllers/campaignController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware); // ✅ protect all campaign routes

router.post("/", createCampaign);
router.get("/", getCampaigns); // ✅ if not added yet
router.delete("/:id", deleteCampaign);

module.exports = router;
