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

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { name, email, phone, totalSpend, visits, tags } = req.body;

    console.log("Update request received:", { id, userId, body: req.body });

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "Name and email are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        details: "Please provide a valid email address"
      });
    }

    // Check if customer exists and belongs to user
    const customer = await Customer.findOne({ _id: id, userId });
    if (!customer) {
      return res.status(404).json({ 
        error: "Customer not found",
        details: "The customer you're trying to update doesn't exist or you don't have permission to update it"
      });
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        totalSpend: parseFloat(totalSpend) || 0,
        visits: parseInt(visits) || 0,
        tags: tags ? tags.split(",").map(tag => tag.trim()).filter(tag => tag !== '') : [],
      },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(500).json({
        error: "Update failed",
        details: "Failed to update customer in database"
      });
    }

    console.log("Customer updated successfully:", updatedCustomer);
    res.json(updatedCustomer);
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ 
      error: "Failed to update customer",
      details: err.message
    });
  }
};

module.exports = { createCustomer, getCustomers, deleteCustomer, updateCustomer };
