// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true }, // ✅ Added phone field
//   password: { type: String, required: true, minlength: 8 }, 
// });

// // ✅ Ensure password is hashed before saving
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next(); // Prevent double hashing
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true }, 
  password: { type: String, required: true, minlength: 8 }, 
});

// ✅ Ensure password is hashed before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Prevent re-hashing
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);

