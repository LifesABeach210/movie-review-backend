const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: false,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    requried: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
});

UserSchema.methods.comparePassword = async function (password) {
  const results = await bcrypt.compare(password, this.password);

  return results;
};

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

module.exports = mongoose.model("User", UserSchema);
