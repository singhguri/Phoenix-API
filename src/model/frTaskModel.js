const mongoose = require("mongoose");

const frTaskSchema = new mongoose.Schema(
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
      required: false,
      default: 10,
      trim: true,
    },
    taskSize: {
      type: String,
      required: false,
      default: "small",
    },
    taskAddUserId: {
      type: String,
      required: false,
    },
    lang: {
      type: String,
      required: false,
      default: "en",
    },
    enTaskId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FrTask", frTaskSchema);
