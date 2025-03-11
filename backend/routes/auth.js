// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { check, validationResult } = require("express-validator");
// const User = require("../models/user");

// const router = express.Router();

// // Register Route with Validation
// router.post(
//   "/register",
//   [
//     check("name", "Name is required").notEmpty(),
//     check("email", "Please include a valid email").isEmail(),
//     check("phone", "Phone number is required").notEmpty(),
//     check("password", "Password must be at least 8 characters").isLength({ min: 8 }),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { name, email, phone, password } = req.body;

//     try {
//       let user = await User.findOne({ email });
//       if (user) return res.status(400).json({ message: "User already exists" });

//       const hashedPassword = await bcrypt.hash(password, 10);
//       user = new User({ name, email, phone, password: hashedPassword });

//       await user.save();
//       res.status(201).json({ message: "User registered successfully!" });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("❌ User not found for email:", email);
//       return res.status(400).json({ message: "User not found" });
//     }

//     console.log("✅ User found:", user.email);
//     console.log("Entered password:", password);
//     console.log("Hashed password from DB:", user.password);

//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("Password match result:", isMatch);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//     res.status(200).json({ message: "Login successful", token, user });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;





// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { check, validationResult } = require("express-validator");
// const User = require("../models/user");

// const router = express.Router();

// // Register Route with Validation
// router.post(
//   "/register",
//   [
//     check("name", "Name is required").notEmpty(),
//     check("email", "Please include a valid email").isEmail(),
//     check("phone", "Phone number is required").notEmpty(),
//     check("password", "Password must be at least 8 characters").isLength({ min: 8 }),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { name, email, phone, password } = req.body;

//     try {
//       let user = await User.findOne({ email });
//       if (user) return res.status(400).json({ message: "User already exists" });

//       const hashedPassword = await bcrypt.hash(password, 10);
//       user = new User({ name, email, phone, password: hashedPassword });

//       await user.save();
//       res.status(201).json({ message: "User registered successfully!" });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("❌ User not found for email:", email);
//       return res.status(400).json({ message: "User not found" });
//     }

//     console.log("✅ User found:", user.email);
//     console.log("Entered password:", password);
//     console.log("Stored hashed password from DB:", user.password);

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("Password match result:", isMatch);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//     res.status(200).json({ message: "Login successful", token, user });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;



const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

// ✅ Register Route with Validation
router.post(
  "/register",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("phone", "Phone number is required").notEmpty(),
    check("password", "Password must be at least 8 characters").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      // 🚀 ✅ Don't hash manually, let schema handle it
      user = new User({ name, email, phone, password });

      await user.save();
      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);


// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(400).json({ message: "User not found" });
    }

    console.log("✅ User found:", user.email);
    console.log("Entered password:", `"${password}"`); // Log with quotes to catch spaces
    console.log("Stored hashed password from DB:", `"${user.password}"`);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.error("❌ Password mismatch - Check if password was hashed correctly.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
