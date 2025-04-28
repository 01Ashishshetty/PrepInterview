const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// ✅ Load environment variables
dotenv.config();

// ✅ Verify JWT Secret Key
const jwtSecret = process.env.JWT_SECRET;
console.log("✅ JWT Secret:", jwtSecret || "❌ JWT_SECRET is missing!");

if (!jwtSecret) {
  console.error("❌ ERROR: JWT_SECRET is not defined in .env file!");
  process.exit(1); // Exit the app if JWT_SECRET is missing
}

// ✅ Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/otp", require("./routes/otp"));  
app.use("/api/forgot-password", require("./routes/forgot-password"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
