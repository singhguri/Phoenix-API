const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    interfaceLanguage: {
      type: String,
      trim: true,
      required: false,
      default: "En",
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
