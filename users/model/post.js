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

  hasSubmited: {
    type: Boolean,
    default: false,
    required: true,
  },
  post: { type: String },
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  ID: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("post", PostSchema);
