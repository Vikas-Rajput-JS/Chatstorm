const mongoose = require("mongoose");
const User = require("../model/user.model");
const Chat = require("../model/chat.model");
const Messages = require("../model/messages.model");
const Socket = require("../model/socket.model");
const errorNotify = async (socket, io, error) => {
  console.log(error, "getting errors");
  io?.to(socket?.id).emit("error_notify", error);
};

module.exports = {
  validateUser: async (socket, next) => {
    try {
      const userId = socket.handshake.headers.token;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return errorNotify(socket, socket, {
          message: "Invalid authorization token",
          success: false,
        });
      }
      let userData = await User.findOne();
      socket.userData = userData;
      let socketDetails = await Socket.findOne({ user: userId });
      if (!socketDetails) {
        await Socket.create({
          user: userId,
          isOnline: true,
          socket: socket.id,
        });
      } else {
        await Socket.updateOne(
          { user: userId },
          {
            $set: {
              socket: socket.id,
              isOnline: true,
            },
          }
        );
      }
      next();
    } catch (error) {}
  },

  joinChat: async (socket, io, data) => {
    try {
      let { receiverId } = data;
      let currentUser = socket?.userData?._id;
      let receiverUser = await User.findById(receiverId);
      if (!receiverUser) {
        return errorNotify(socket, io, { message: "Invalid User" });
      }
      let findSocket = await Socket.findOne({ user: receiverId });
      let existChat = await Chat.findOne({
        $or: [
          {
            senderId: receiverUser?._id,
            receiverId: new mongoose.Types.ObjectId(currentUser),
          },
          {
            receiverId: receiverUser?._id,
            senderId: new mongoose.Types.ObjectId(currentUser),
          },
        ],
      });
      if (!findSocket) {
        await Socket.create({
          user: receiverId,
        });
      }
      if (!existChat?._id) {
        existChat = await Chat.create({
          senderId: currentUser,
          receiverId: receiverId,
        });
      }
      io?.to(socket.id).emit("handshake_success", {
        message: "Chat joinded successfully",
        success: true,
        data: receiverUser,
      });
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },

  sendMessage: async (socket, io, data) => {
    try {
      let { receiverId, message } = data;
      let currentUser = socket?.userData?._id;
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return errorNotify(socket, io, { message: "Invalid User" });
      }
      let receiverUser = await User.findById(receiverId);
      let receivedSocket = await Socket.findOne({ user: receiverId });
      let existChat = await Chat.findOne({
        $or: [
          {
            senderId: receiverUser?._id,
            receiverId: new mongoose.Types.ObjectId(currentUser),
          },
          {
            receiverId: receiverUser?._id,
            senderId: new mongoose.Types.ObjectId(currentUser),
          },
        ],
      });

      if (!existChat) {
        existChat = await Chat.create({
          senderId: currentUser,
          receiverId: receiverUser?._id,
          lastMessage: message,
        });
      }
      existChat.lastMessage = message;
      await existChat.save();
      let newMessage = await Messages.create({
        message: message,
        chatId: existChat?._id,
        senderId: currentUser,
        receiverId: receiverUser?._id,
      });

      io?.to(receivedSocket?.socket)?.emit("receive_message", {
        message: "Message received successfully",
        data: { ...newMessage._doc, user: currentUser },
        success: true,
      });

      io?.to(socket?.id)?.emit("message_sent", {
        message: "Message sent successfully",
        data: { ...newMessage._doc, user: receiverId },
        success: true,
      });
      let user = await User.findById(receivedSocket?.user);
      // if (user?.fcmToken) {
      //   await sendNotification(user?.fcmToken, {
      //     title: `${socket?.userData?.name} sent you a message`,
      //     body: message?.text ? message?.text : "Media",
      //   });
      // }
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },

  getOldChat: async (socket, io, data) => {
    try {
      let { receiverId, keyword } = data;
      let currentUser = socket?.userData?._id;
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return errorNotify(socket, io, { message: "Invalid User" });
      }
      let receiverUser = await User.findById(receiverId);
      let existChat = await Chat.findOne({
        $or: [
          {
            senderId: receiverUser?._id,
            receiverId: new mongoose.Types.ObjectId(currentUser),
          },
          {
            receiverId: receiverUser?._id,
            senderId: new mongoose.Types.ObjectId(currentUser),
          },
        ],
      });

      if (!existChat) {
        existChat = await Chat.create({
          senderId: currentUser,
          receiverId: receiverUser?._id,
        });
      }
      let messages = await Messages.aggregate([
        {
          $match: {
            chatId: existChat?._id,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "receiverId",
            foreignField: "_id",
            as: "receiverId",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "senderId",
          },
        },
        {
          $unwind: {
            path: "$receiverId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$senderId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
      ]);

      io?.to(socket?.id).emit("retrieve_message", {
        data: messages,
        success: true,
        message: "Older message fetched successfully",
      });
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },

  getChatlist: async (socket, io, data) => {
    try {
      let { keyword } = data;
      let userId = socket?.userData?._id;
      let pipiline = [
        {
          $match: {
            $or: [{ senderId: userId }, { receiverId: userId }],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "senderId",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "receiverId",
            foreignField: "_id",
            as: "receiverId",
          },
        },

        {
          $unwind: {
            path: "$senderId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$receiverId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
      ];
      if (keyword && keyword.trim() !== "") {
        pipiline.push({
          $match: {
            $or: [
              { "senderId.name": { $regex: keyword, $options: "i" } },
              { "receiverId.name": { $regex: keyword, $options: "i" } },
            ],
          },
        });
      }

      let chatlist = await Chat.aggregate(pipiline);
      io?.to(socket?.id).emit("chatlist", {
        data: chatlist,
        message: "Chat list fetched successfully",
        success: true,
      });
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },

  deleteMessage: async (socket, io, data) => {
    try {
      let { messageId } = data;
      let message = await Messages.findById(messageId);
      const receiverUser = await Socket.findOne({ user: message?.receiverId });
      if (message?.senderId?.toString() == socket?.userData?._id?.toString()) {
        let deletemesage = await Messages.updateOne(
          { _id: messageId },
          {
            $set: {
              isDeleted: true,
            },
          }
        );
        io?.to(socket.id).emit("message_update", {
          data: message,
          receiverId: message?.receiverId,
          success: true,
          message: "Message deleted successfully",
        });
        io?.to(receiverUser.socket).emit("message_update_receiver", {
          data: message,
          senderId: message?.senderId,
          success: true,
          message: "Message deleted successfully",
        });
      } else {
        return errorNotify(socket, io, {
          message: "Something went wrong",
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      errorNotify(socket, io, error);
    }
  },

  updateTypingAlert: async (socket, io, data) => {
    let { receiverId, type } = data;
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return errorNotify(socket, io, { message: "Invalid User" });
    }
    let userSocket = await Socket.findOne({ user: receiverId });
    if (!userSocket) {
      return errorNotify(socket, io, {
        message: "Something Went wrong",
        success: false,
      });
    }
    io?.to(userSocket?.socket).emit("typing_alert", {
      data: {
        senderId: socket?.userData?._id,
        isTyping: type == "user_typing" ? true : false,
      },
      message: "User is typing",
      success: true,
    });
  },

  calltoUser: async (socket, io, data) => {
    try {
      let { userId } = data;
      let user = await Socket.findOne({ user: userId });
      let userdetails = await User.findById(socket?.userData?._id);
      if (user) {
        io?.to(user.socket).emit("incoming-call", {
          from: socket?.userData?._id,
          offer: data?.offer,
          type: data?.type,
          user: userdetails,
        });
      }
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },

  AnswerCall: async (socket, io, data) => {
    try {
      const { userId, answer } = data;
      if (!userId) {
        return errorNotify(socket, io, { message: "Invalid User" });
      }
      const user = await Socket.findOne({ user: userId });
      // let userdetails = await User.findById(userId);

      if (user) {
        io.to(user.socket).emit("call-answered", {
          answer: answer,
          // data: userdetails,
        });
      }
      io.to(socket.id).emit("call-answered", {
        answer: answer,
        // data: userdetails,
      });
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },
  rejectCall: async (socket, io, data) => {
    try {
      const { userId } = data;
      const user = await Socket.findOne({ user: userId });
      if (user) {
        io.to(user.socket).emit("call-ended", {
          userId: socket?.userData?._id,
        });
      }
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },

  leaveCall: async (socket, io, data) => {
    try {
      let { userId } = data;
      console.log(userId);
      const user = await Socket.findOne({ user: userId });
      if (user) {
        io.to(user.socket).emit("call-ended", {
          userId: socket?.userData?._id,
        });
      }
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },

  handleCandidate: async (socket, io, data) => {
    try {
      const { userId, candidate } = data;
      const user = await Socket.findOne({ user: userId });
      if (user && user.socket) {
        io.to(user.socket).emit("ice-candidate", {
          candidate: candidate,
        });
      }
      io.to(socket.id).emit("ice-candidate", {
        candidate: candidate,
      });
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },

  disconnectHandshake: async (socket, io, data) => {
    try {
      let userId = socket?.userData?._id;
      await Socket.updateOne(
        { user: userId },
        {
          $set: {
            isOnline: false,
          },
        }
      );
      console.log(socket.id, "Disconnected now");
      io?.to(socket.id).emit("leave", {
        message: "Handhake disconnected successfully",
        sucess: true,
      });
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },
};
