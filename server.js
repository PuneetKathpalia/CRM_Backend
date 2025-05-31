const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./utils/database");
const CommunicationLog = require("./models/CommunicationLog");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/segments", require("./routes/segmentRoutes"));
app.use("/api/campaigns", require("./routes/campaignRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/delivery", require("./routes/deliveryRoutes"));
app.use("/api/vendor", require("./routes/vendorRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));


app.post("/api/vendor/send", async (req, res) => {
  const { campaignId, customerId, message } = req.body;
  const isSuccess = Math.random() < 0.9;
  const status = isSuccess ? "SENT" : "FAILED";

  await CommunicationLog.create({ campaignId, customerId, message, status });
  res.json({ status });
});

app.get("/", (req, res) => {
  res.send("🚀 Mini CRM Backend Running!");
});

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});
