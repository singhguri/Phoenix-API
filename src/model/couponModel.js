const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    usersCount: {
      type: Number,
      required: false,
      default: 0,
    },
    maxUsersCount: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    logoImg: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
