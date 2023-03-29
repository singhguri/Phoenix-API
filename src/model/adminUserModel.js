const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: false,
      unique: true,
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
    source: {
      type: String,
      required: true,
      default: "system",
    },
    verified_email: {
      type: Boolean,
      require: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isAdminUser: {
      type: Boolean,
      required: false,
      default: false,
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
    tasks: {
      type: [Object],
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("adminUser", adminUserSchema);
