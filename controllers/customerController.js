const Customer = require("../models/Customer");

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, totalSpend, visits, tags } = req.body;

    const customer = await Customer.create({
      userId: req.user.sub, 
      name,
      email,
      phone,
      totalSpend,
      visits,
      tags,
    });

    res.status(201).json(customer);
  } catch (err) {
    console.error("❌ Error saving customer:", err);
    res.status(500).json({ message: "Failed to create customer" });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user.sub }); 
    res.json(customers);
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub; // Assuming user ID is available in req.user.sub

    const customer = await Customer.findOneAndDelete({ _id: id, userId });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found or you do not have permission to delete it." });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
};

module.exports = { createCustomer, getCustomers, deleteCustomer };
