const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profileImage: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    }, // encrypted password
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
