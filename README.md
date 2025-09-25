
# ⚡ ChatStorm

![ChatStorm Logo](https://img.shields.io/badge/ChatStorm-Real--Time%20Chat-blue?style=for-the-badge&logo=socket.io)

**A powerful, lightning-fast Socket.io-based chat server for your applications**

[![npm version](https://img.shields.io/npm/v/chatstorm.svg?style=flat-square)](https://www.npmjs.com/package/chatstorm)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=flat-square)](https://nodejs.org/)

---

## 🚀 Features

- ⚡ **Real-Time Messaging** - Instant message delivery using Socket.io
- 🗄️ **MongoDB Integration** - Persistent message storage and history
- 🔒 **Private Messaging** - Secure one-on-one conversations
- 📱 **Cross-Platform** - Works with web and mobile applications
- 🎯 **Easy Integration** - Simple setup with minimal configuration
- 📈 **Scalable** - Handles multiple concurrent users effortlessly
- 🎨 **Customizable** - Flexible architecture for your needs

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Step 1: Install ChatStorm

```bash
npm install chatstorm
```

### Step 2: Environment Setup

Create a `.env` file in your project root:

```bash
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017/chatstorm

# Server Port
PORT=3000
```

---

## 🛠️ Quick Start

### Basic Implementation

```javascript
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const express = require("express");
const ChatStorm = require("chatstorm");
require("dotenv").config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to ChatStorm ⚡");
});

// Server setup
let server;
try {
  mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("✅ Connected to MongoDB");
    
    // Create HTTP server
    const nodeServer = http.createServer(app);
    
    // Initialize ChatStorm
    ChatStorm(nodeServer);
    
    // Start server
    server = nodeServer.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  });
} catch (error) {
  console.error("❌ Error:", error);
}
```

### Complete Example

```javascript
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const express = require("express");
const ChatStorm = require("chatstorm");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ChatStorm ⚡",
    version: "1.0.4",
    status: "running"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Server initialization
let server;
try {
  mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("✅ Connected to MongoDB");
    
    const nodeServer = http.createServer(app);
    ChatStorm(nodeServer);
    
    server = nodeServer.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(`🚀 ChatStorm server running on port ${process.env.PORT}`);
      console.log(`📱 Access your chat server at: http://localhost:${process.env.PORT}`);
    });
  });
} catch (error) {
  console.error("❌ Server initialization failed:", error);
}

// Graceful shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log("🔒 Server closed gracefully");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on("uncaughtException", exitHandler);
process.on("unhandledRejection", exitHandler);
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received");
  if (server) {
    server.close();
  }
});
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URL` | MongoDB connection string | - | ✅ |
| `PORT` | Server port | `3000` | ❌ |

### MongoDB Setup

1. **Local MongoDB:**
   ```bash
   MONGODB_URL=mongodb://localhost:27017/chatstorm
   ```

2. **MongoDB Atlas (Cloud):**
   ```bash
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chatstorm
   ```

---

## 🏗️ Project Structure

```
chatstorm/
├── Config/
│   └── rainbow.js          # Animated logging utility
├── model/
│   ├── chat.model.js       # Chat room model
│   ├── messages.model.js   # Message model
│   ├── socket.model.js     # Socket connection model
│   └── user.model.js       # User model
├── Sockets/
│   ├── config.js           # Socket.io configuration
│   └── controller.js       # Socket event handlers
├── server.js               # Main server file
└── package.json           # Dependencies and scripts
```

---

## 🚀 Development

### Running in Development Mode

```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/health` | Health check |

---

## 🔌 Socket Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `joinchat` | `{receiverId}` | Join a chat with another user |
| `send_message` | `{receiverId, message}` | Send a message to a user |
| `chat_message` | `{receiverId, keyword?}` | Get chat history with a user |
| `get_chatlist` | `{keyword?}` | Get list of all chats |
| `delete_message` | `{messageId}` | Delete a specific message |
| `user_typing` | `{receiverId, type}` | Send typing indicator (user_typing/stop_typing) |
| `call-user` | `{userId, offer, type}` | Initiate a video call |
| `answer-call` | `{userId, answer}` | Answer an incoming call |
| `reject-call` | `{userId}` | Reject an incoming call |
| `leave-call` | `{userId}` | Leave an active call |
| `ice-candidate` | `{userId, candidate}` | Send ICE candidate for WebRTC |
| `disconnect_user` | `{}` | Disconnect user session |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `handshake_success` | `{message, success, data}` | Chat joined successfully |
| `message_sent` | `{message, data, success}` | Message sent confirmation |
| `receive_message` | `{message, data, success}` | Receive a new message |
| `retrieve_message` | `{data, success, message}` | Chat history retrieved |
| `chatlist` | `{data, message, success}` | Chat list received |
| `message_update` | `{data, receiverId, success, message}` | Message updated (deleted) |
| `message_update_receiver` | `{data, senderId, success, message}` | Message update notification for receiver |
| `typing_alert` | `{data, message, success}` | Typing indicator received |
| `incoming-call` | `{from, offer, type, user}` | Incoming call notification |
| `call-answered` | `{answer}` | Call answered notification |
| `call-ended` | `{userId}` | Call ended notification |
| `ice-candidate` | `{candidate}` | ICE candidate received |
| `leave` | `{message, success}` | Disconnect confirmation |
| `error_notify` | `{message, success}` | Error notification |

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Vikas Rajput**

- GitHub: [@vikasrajput](https://github.com/Vikas-Rajput-JS)
- NPM: [chatstorm](https://www.npmjs.com/package/chatstorm)

---

## ⭐ Support

If you find ChatStorm helpful, please give it a star on GitHub!

**Made with ❤️ for the developer community**

