const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const { customerId, amount, date } = req.body;

    const order = await Order.create({
      userId: req.user.sub,
      customerId,
      amount,
      date,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.sub });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = { createOrder, getOrders };
