const express = require("express");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const User = require("../models/user");
const Otp = require("../models/otp");
const sendOtpEmail = require("../config/email");

const router = express.Router();


/**
 * 🔹 Step 1: Send OTP for Password Reset
 */
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

    // Hash the OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store OTP in DB (Replace old OTP if exists)
    await Otp.findOneAndUpdate(
      { email },
      { otp: hashedOtp, createdAt: Date.now() },
      { upsert: true }
    );

    // Send OTP email
    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🔹 Step 2: Verify OTP
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: "OTP expired or invalid" });

    // Check OTP expiration (5 minutes)
    const otpAge = (Date.now() - otpRecord.createdAt) / 1000; // in seconds
    if (otpAge > 300) {
      await Otp.deleteOne({ email }); // Delete expired OTP
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    // Delete OTP after successful verification
    await Otp.deleteOne({ email });

    res.json({ message: "OTP verified. You can now reset your password." });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🔹 Step 3: Reset Password (After OTP Verification)
 */
router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
  
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      console.log("✅ User found for password reset:", email);
      console.log("🔑 New password entered:", newPassword);
  
      // ✅ Generate Salt & Hash New Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      console.log("🔒 Hashed Password Before Save:", hashedPassword);
  
      user.password = hashedPassword;
      await user.save();
  
      // ✅ Verify stored password after saving
      const checkUser = await User.findOne({ email });
      console.log("🔍 Stored hashed password in MongoDB:", checkUser.password);
      console.log("Checking password one more time ", await bcrypt.compare(newPassword, checkUser.password));
  
      res.json({ message: "Password reset successfully. Try logging in now." });
    } catch (error) {
      console.error("❌ Reset Password Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  
  
  
module.exports = router;
