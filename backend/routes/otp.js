const express = require("express");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const User = require("../models/user");
const Otp = require("../models/otp");
const sendOtpEmail = require("../config/email");

const router = express.Router();

// ✅ 1️⃣ Generate OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({email})
    await Otp.create({ email, otp: hashedOtp });

    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 2️⃣ Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: "OTP expired or invalid" });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    await Otp.deleteOne({ email }); // Remove used OTP

    res.json({ message: "OTP verified", verified: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 3️⃣ Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  console.log("new password entered ", newPassword)

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });


    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

