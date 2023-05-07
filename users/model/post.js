const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  firstname: {
    type: String,
    unique: false,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    unique: false,
    required: true,
    trim: true,
  },
  Bio: {
    type: String,
    unique: false,
    required: true,
    trim: false,
  },
  post: { type: String, unique: false, required: true },
  hasSubmited: {
    type: Boolean,
    default: false,
    required: true,
  },

  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("post", PostSchema);
