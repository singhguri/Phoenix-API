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
    enTasks: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    frTasks: {
      type: mongoose.Schema.Types.Mixed,
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

// delete room after 24 hours
roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("Room", roomSchema);
