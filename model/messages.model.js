const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      text: {
        type: String,
      },
      media: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    chatId: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Message", MessageSchema);

module.exports = Messages;
