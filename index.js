const express = require("express");
const cors = require("cors");
const connectDB = require("./config");
require("dotenv").config();

const app = express();

console.log("🚀 Initializing Server...");

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Test Route to Check Server Status
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// Use Routes
app.use("/api", require("./routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
