const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: false,
      unique: true,
    },
    family_name: {
      type: String,
      required: true,
      trim: true,
    },
    given_name: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      default: "",
      required: false,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    verified_email: {
      type: Boolean,
      require: true,
    },
    profileImage: {
      type: String,
      required: false,
      default: "",
    },
    source: {
      type: String,
      required: true,
      default: "system",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isAdminUser: {
      type: Boolean,
      required: true,
      default: false,
    },
    coins: {
      type: Number,
      required: false,
      default: 0,
    },
    gender: {
      type: String,
      default: "",
      required: false,
    },
    salt: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: Number,
      required: false,
      default: 2,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
