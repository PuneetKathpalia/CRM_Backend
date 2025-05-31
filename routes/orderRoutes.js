const express = require("express");
const router = express.Router();
const { createOrder, getOrders } = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware); // ✅ protect all order routes

router.post("/", createOrder);
router.get("/", getOrders);

module.exports = router;
