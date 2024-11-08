const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  created: { type: Date, default: new Date().getTime() },
});

module.exports = mongoose.model("User", userSchema);
