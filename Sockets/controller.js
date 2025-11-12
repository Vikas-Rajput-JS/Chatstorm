const mongoose = require("mongoose");
const User = require("../model/user.model");
const Chat = require("../model/chat.model");
const Messages = require("../model/messages.model");
const Socket = require("../model/socket.model");
const animatelogger = require("../Config/rainbow");
const errorNotify = async (socket, io, error) => {
  console.log(error, "getting errors");
  io?.to(socket?.id).emit("error_notify", error);
};

module.exports = {
  validateUser: async (socket, next) => {
    try {
      const userId = socket.handshake.headers.token;
      console.log(socket.handshake.headers);
      console.log(userId);
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return errorNotify(socket, socket, {
          message: "Invalid authorization token",
          success: false,
        });
      }
      let userData = await User.findOne({ _id: userId });
      console.log(
        `${
          userData?.name || userData?.fullName || userData?.username
        } is Connected Successfully`
      );
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
    } catch (error) {
      animatelogger(`${error}`);
    }
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
        data: {
          _id: receiverUser?._id,
          image: receiverUser?.image,
          name: receiverUser?.name,
          username: receiverUser?.username,
          email: receiverUser?.email,
          phone: receiverUser?.phone,
          fullName: receiverUser?.fullName,
          firstName: receiverUser?.firstName,
          lastName: receiverUser?.lastName,
          gender: receiverUser?.gender,
          age: receiverUser?.age,
          status: receiverUser?.status,
          role: receiverUser?.role,
          isDeleted: receiverUser?.isDeleted,
        },
      });
      io?.to(findSocket?.socket).emit("chat_status", {
        message: `${socket?.userData?.name} has joined the chat`,
        isJoined: true,
        data: {
          _id: socket?.userData?._id,
          image: socket?.userData?.image,
          name: socket?.userData?.name,
          username: socket?.userData?.username,
          email: socket?.userData?.email,
          phone: socket?.userData?.phone,
        },
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
        data: {
          ...newMessage._doc,
          user: {
            _id: socket?.userData?._id,
            image: socket?.userData?.image,
            name: socket?.userData?.name,
            username: socket?.userData?.username,
            email: socket?.userData?.email,
            phone: socket?.userData?.phone,
          },
          senderDetails: {
            _id: socket?.userData?._id,
            image: socket?.userData?.image,
            name: socket?.userData?.name,
            username: socket?.userData?.username,
            email: socket?.userData?.email,
            phone: socket?.userData?.phone,
          },
          receiverDetails: {
            _id: receiverUser?._id,
            image: receiverUser?.image,
            name: receiverUser?.name,
            username: receiverUser?.username,
            email: receiverUser?.email,
            phone: receiverUser?.phone,
          },
        },
        success: true,
      });

      io?.to(socket?.id)?.emit("message_sent", {
        message: "Message sent successfully",
        data: {
          ...newMessage._doc,
          user: {
            _id: receiverUser?._id,
            image: receiverUser?.image,
            name: receiverUser?.name,
            username: receiverUser?.username,
            email: receiverUser?.email,
            phone: receiverUser?.phone,
          },
          senderDetails: {
            _id: socket?.userData?._id,
            image: socket?.userData?.image,
            name: socket?.userData?.name,
            username: socket?.userData?.username,
            email: socket?.userData?.email,
            phone: socket?.userData?.phone,
          },
          receiverDetails: {
            _id: receiverUser?._id,
            image: receiverUser?.image,
            name: receiverUser?.name,
            username: receiverUser?.username,
            email: receiverUser?.email,
            phone: receiverUser?.phone,
          },
        },
        success: true,
      });
      // let user = await User.findById(receivedSocket?.user);
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
      await Messages.updateMany(
        {
          receiverId: receiverId,
          senderId: currentUser,
          isSeen: false,
        },
        {
          $set: {
            isSeen: true,
          },
        }
      );
      await Messages.updateMany(
        {
          senderId: receiverId,
          receiverId: currentUser,
          isSeen: false,
        },
        {
          $set: {
            isSeen: true,
          },
        }
      );
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
      let filters = {};
      if (keyword) {
        filters = {
          $or: [
            {
              "message.text": {
                $regex: keyword,
                $options: "i",
              },
            },
            {
              "message.media": {
                $regex: keyword,
                $options: "i",
              },
            },
            {
              "message.url": {
                $regex: keyword,
                $options: "i",
              },
            },
          ],
        };
      }
      let messages = await Messages.aggregate([
        {
          $match: {
            chatId: existChat?._id,
            // ...filters,
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
        {
          $project: {
            message: {
              text: 1,
              media: 1,
              url: 1,
            },
            senderId: {
              _id: 1,
              name: 1,
              role: 1,
              image: 1,
              username: 1,
              email: 1,
              phoneNumber: 1,
            },
            receiverId: {
              _id: 1,
              name: 1,
              role: 1,
              image: 1,
              username: 1,
              email: 1,
              phoneNumber: 1,
            },
            createdAt: 1,
            updatedAt: 1,
            chatId: 1,
            isSeen: 1,
            isDeleted: 1,
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
      let userIdObjectId = new mongoose.Types.ObjectId(userId);
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
          $lookup: {
            from: "sockets",
            localField: "senderId._id",
            foreignField: "user",
            as: "senderSocket",
          },
        },
        {
          $lookup: {
            from: "sockets",
            localField: "receiverId._id",
            foreignField: "user",
            as: "receiverSocket",
          },
        },
        {
          $unwind: {
            path: "$senderSocket",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$receiverSocket",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            "senderId.isOnline": { $ifNull: ["$senderSocket.isOnline", false] },
            "receiverId.isOnline": {
              $ifNull: ["$receiverSocket.isOnline", false],
            },
          },
        },
        {
          $lookup: {
            from: "messages",
            let: {
              chatId: "$_id",
              currentUserId: userIdObjectId,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$chatId", "$$chatId"] },
                      { $eq: ["$receiverId", "$$currentUserId"] },
                      { $eq: ["$isSeen", false] },
                    ],
                  },
                },
              },
            ],
            as: "unreadMessages",
          },
        },
        {
          $lookup: {
            from: "messages",
            let: { chatId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$chatId", "$$chatId"] },
                      { $eq: ["$isSeen", false] },
                    ],
                  },
                },
              },
            ],
            as: "allMessages",
          },
        },
        {
          $addFields: {
            unreadCount: { $size: "$unreadMessages" },
            messageCount: { $size: "$allMessages" },
          },
        },
        {
          $project: {
            senderSocket: 0,
            receiverSocket: 0,
            unreadMessages: 0,
            allMessages: 0,
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        {
          $project: {
            senderId: {
              _id: 1,
              name: 1,
              role: 1,
              image: 1,
              username: 1,
              email: 1,
              phoneNumber: 1,
            },
            receiverId: {
              _id: 1,
              name: 1,
              role: 1,
              image: 1,
              username: 1,
              email: 1,
              phoneNumber: 1,
            },
            unreadCount: 1,
            messageCount: 1,
            updatedAt: 1,
            createdAt: 1,
            lastMessage: 1,
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

  checkOnlineStatus: async (socket, io, data) => {
    let { receiverId } = data;
    console.log(data);
    let socketUser = await Socket.findOne({ user: receiverId });
    if (socketUser?.isOnline) {
      console.log("sending online status");
      io.to(socket.id).emit("online_status", {
        isOnline: true,
        receiverId: receiverId,
        message: "User is online",
      });
    } else {
      io.to(socket.id).emit("online_status", {
        isOnline: false,
        receiverId: receiverId,
        message: "User is offline",
      });
    }
  },

  leaveChat: async (socket, io, data) => {
    try {
      let { receiverId } = data;
      let currentUser = socket?.userData?._id;
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return errorNotify(socket, io, { message: "Invalid User" });
      }
      let receiverUser = await User.findById(receiverId);
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
      if (!existChat) {
        return errorNotify(socket, io, { message: "Chat not found" });
      }

      io?.to(socket.id).emit("chat_status", {
        message: "Chat left successfully",
        isLeft: true,
      });
      io?.to(findSocket?.socket).emit("chat_status", {
        message: "User has left the chat",
        isLeft: true,
      });
    } catch (error) {
      errorNotify(socket, io, error);
    }
  },
};
