const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const express = require("express");
const animatelogger = require("./Config/rainbow");

require("dotenv").config();
let app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.send("Welcome To ChatStorm");
});
let server;
try {
  mongoose.connect(process.env.MONGODB_URL).then(() => {
    animatelogger("Connected to MongoDB");
    const nodeServer = http.createServer(app);
    require("./Sockets/config")(nodeServer);
    server = nodeServer.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(`Listening to port ${process.env.PORT}`);
    });
  });
} catch (error) {
  console.log(error);
}

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  console.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
