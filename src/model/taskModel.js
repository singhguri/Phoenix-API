const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    taskDesc: {
      type: String,
      required: true,
      trim: true,
    },
    taskType: {
      type: String,
      required: true,
      trim: true,
    },
    taskTiming: {
      type: Number,
      required: true,
      default: 10,
      trim: true,
    },
    taskAddUserId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
