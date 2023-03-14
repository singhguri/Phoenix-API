const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    hostUserId: {
      type: String,
      required: true,
    },
    winnerUserId: {
      type: String,
      required: false,
    },
    tasks: {
      type: [Object],
      required: false,
    },
    bigTasks: {
      type: [Object],
      required: false,
    },
    requiredCoins: {
      type: Number,
      required: false,
      default: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
