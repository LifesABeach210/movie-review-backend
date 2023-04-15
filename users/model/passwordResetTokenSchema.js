const mongoose = require("mongoose");

var bcrypt = require("bcrypt");
const passwordResetTokenSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expres: 3600,
    default: Date.now(),
  },
});

passwordResetTokenSchema.pre("save", async function (next) {
  //non arrow function use "this". differently
  if (this.isModified("token")) {
    this.token = await bcrypt.hash(this.token, 10);
  }
  next();
});
passwordResetTokenSchema.methods.comparePassword = async function (token) {
  const results = await bcrypt.compare(token, this.token);

  return results;
};

module.exports = mongoose.model("passwordResetToken", passwordResetTokenSchema);
