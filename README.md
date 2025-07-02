
# ChatStorm

# ChatStorm - Real-Time Chat Server

**ChatStorm** is a powerful and easy-to-use real-time chat server for your application, powered by **Socket.io** and integrated with **MongoDB** for message storage. It enables seamless, scalable chat features for web and mobile applications.

## Features
- **Real-Time Messaging**: Supports instant message delivery using **Socket.io**.
- **MongoDB Integration**: Chat data and message history are stored in MongoDB.
- **Easy Integration**: Simple to add to any Node.js application with minimal setup.
- **Private Messaging**: Users can send private messages to each other.
- **Scalable**: Designed to handle multiple concurrent users with ease.

---

## Installation

### 1. Install ChatStorm via NPM

In your Node.js project, install the `chatstorm` package from NPM:

```bash
npm install chatstorm
```
In your Node.js project, Set These  ENV Variables:
```bash
MONGODB_URL=mongodb://localhost:27017/chatstorm
PORT=3000
```

```
const ChatStorm = require("chatstorm");

```

```
const nodeServer = http.createServer(app);
```

```
    ChatStorm(nodeServer);

```

```
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const express = require("express");
const ChatStorm = require("chatstorm");
require("dotenv").config();

let app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", async (req, res) => {
  res.send("Welcome To ChatStorm");
});

let server;
try {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connected to MongoDB");

    // Create HTTP server for Express
    const nodeServer = http.createServer(app);

    // Initialize ChatStorm with the HTTP server
    ChatStorm(nodeServer);

    // Start the server
    server = nodeServer.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(`Listening to port ${process.env.PORT}`);
    });
  });
} catch (error) {
  console.log(error);
}

