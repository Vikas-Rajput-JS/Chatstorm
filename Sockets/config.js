const socketIo = require("socket.io");
const socketController = require("./controller");
const animatelogger = require("../Config/rainbow");
const mongoose = require("mongoose")
require("dotenv").config();

module.exports = async (server,DB_URI) => {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowHeaders: ["Authorization"],
      credentials: true,
    },
  });
  mongoose.connect(DB_URI).then((res)=>{
    animatelogger("Socket DB Connected Successfully")
  })
  animatelogger("Socket are connected successfully");
  
  
  io.use(socketController.validateUser);
  io.on("connection", (Socket) => {
    Socket.on("joinchat", async (data) =>
      socketController.joinChat(Socket, io, data)
    );
    Socket.on("get_chatlist", async (data) =>
      socketController.getChatlist(Socket, io, data)
    );
    Socket.on("chat_message", async (data) =>
      socketController.getOldChat(Socket, io, data)
    );
    Socket.on("send_message", async (data) =>
      socketController.sendMessage(Socket, io, data)
    );
    Socket.on("delete_message", async (data) =>
      socketController.deleteMessage(Socket, io, data)
    );
    Socket.on("user_typing", async (data) =>
      socketController.updateTypingAlert(Socket, io, data)
    );

    // Video call routes
    Socket.on("call-user", async (data) =>
      socketController.calltoUser(Socket, io, data)
    );
    Socket.on("ice-candidate", async (data) =>
      socketController.handleCandidate(Socket, io, data)
    );
    Socket.on("answer-call", async (data) =>
      socketController.AnswerCall(Socket, io, data)
    );
    Socket.on("reject-call", async (data) =>
      socketController.rejectCall(Socket, io, data)
    );

    Socket.on("leave-call", async (data) =>
      socketController.leaveCall(Socket, io, data)
    );
    Socket.on("disconnect_user", async (data) =>
      socketController.disconnectHandshake(Socket, io, data)
    );
  });
};
