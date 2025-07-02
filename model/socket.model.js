const mongoose = require("mongoose");

const socketSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },
    socket: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Socket = mongoose.model("socket", socketSchema);

module.exports = Socket;
