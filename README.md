
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
| `joinchat` | `{receiverId: string}` | Join a chat with another user |
| `send_message` | `{receiverId: string, message: object}` | Send a message to a user |
| `chat_message` | `{receiverId: string, keyword?: string}` | Get chat history with a user (automatically marks messages as seen) |
| `get_chatlist` | `{keyword?: string}` | Get list of all chats with unread counts |
| `delete_message` | `{messageId: string}` | Delete a specific message |
| `user_typing` | `{receiverId: string, type: string}` | Send typing indicator (`user_typing` or `stop_typing`) |
| `leave_chat` | `{receiverId: string}` | Leave a chat conversation |
| `check_online_status` | `{receiverId: string}` | Check if a user is online |
| `call-user` | `{userId: string, offer: object, type: string}` | Initiate a video call |
| `answer-call` | `{userId: string, answer: object}` | Answer an incoming call |
| `reject-call` | `{userId: string}` | Reject an incoming call |
| `leave-call` | `{userId: string}` | Leave an active call |
| `ice-candidate` | `{userId: string, candidate: object}` | Send ICE candidate for WebRTC |
| `disconnect_user` | `{}` | Disconnect user session |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `handshake_success` | `{message: string, success: boolean, data: UserObject}` | Chat joined successfully. Returns structured user data |
| `chat_status` | `{message: string, isJoined?: boolean, isLeft?: boolean, data?: UserObject}` | Chat status update (user joined/left) |
| `message_sent` | `{message: string, data: MessageObject, success: boolean}` | Message sent confirmation with structured user data |
| `receive_message` | `{message: string, data: MessageObject, success: boolean}` | Receive a new message with structured user data |
| `retrieve_message` | `{data: MessageArray, success: boolean, message: string}` | Chat history retrieved (messages marked as seen) |
| `chatlist` | `{data: ChatArray, message: string, success: boolean}` | Chat list received with unread counts and structured user data |
| `message_update` | `{data: MessageObject, receiverId: string, success: boolean, message: string}` | Message updated (deleted) - sender notification |
| `message_update_receiver` | `{data: MessageObject, senderId: string, success: boolean, message: string}` | Message update notification for receiver |
| `typing_alert` | `{data: {senderId: string, isTyping: boolean}, message: string, success: boolean}` | Typing indicator received |
| `online_status` | `{isOnline: boolean, receiverId: string, message: string}` | Online status response |
| `incoming-call` | `{from: string, offer: object, type: string, user: UserObject}` | Incoming call notification |
| `call-answered` | `{answer: object}` | Call answered notification |
| `call-ended` | `{userId: string}` | Call ended notification |
| `ice-candidate` | `{candidate: object}` | ICE candidate received |
| `leave` | `{message: string, success: boolean}` | Disconnect confirmation |
| `error_notify` | `{message: string, success: boolean}` | Error notification |

### Data Structures

#### UserObject
```typescript
{
  _id: string;
  image?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: number;
  status?: string;
  role?: string;
  isDeleted?: boolean;
  isOnline?: boolean; // Only in chatlist
  phoneNumber?: string; // Only in message responses
}
```

#### MessageObject
```typescript
{
  _id: string;
  message: {
    text?: string;
    media?: string;
    url?: string;
  };
  senderId: UserObject;
  receiverId: UserObject;
  chatId: string;
  isSeen: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: UserObject; // Current user context
  senderDetails: UserObject;
  receiverDetails: UserObject;
}
```

#### ChatObject (in chatlist)
```typescript
{
  _id: string;
  senderId: UserObject;
  receiverId: UserObject;
  lastMessage: string;
  unreadCount: number; // Count of unread messages for current user
  messageCount: number; // Count of all unread messages (isSeen: false)
  createdAt: Date;
  updatedAt: Date;
}
```

### Important Notes

- **Authentication**: All socket connections require a `token` header in the handshake with a valid MongoDB ObjectId
- **Message Seen Status**: When `chat_message` is called, all messages between the users are automatically marked as `isSeen: true`
- **Unread Count**: The `unreadCount` in chatlist represents messages where `receiverId` matches the current user and `isSeen: false`
- **Message Count**: The `messageCount` in chatlist represents all messages in the chat where `isSeen: false`
- **Online Status**: Users' online status is automatically tracked and included in chatlist responses

---

## 💡 Usage Examples

### Client-Side Implementation

```javascript
import io from 'socket.io-client';

// Connect to socket with authentication token
const socket = io('http://localhost:3000', {
  extraHeaders: {
    token: 'YOUR_USER_ID' // MongoDB ObjectId
  }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected to ChatStorm');
});

// Join a chat
socket.emit('joinchat', { receiverId: 'RECEIVER_USER_ID' });

// Listen for join confirmation
socket.on('handshake_success', (data) => {
  console.log('Chat joined:', data);
});

// Listen for chat status updates (user joined/left)
socket.on('chat_status', (data) => {
  if (data.isJoined) {
    console.log('User joined:', data.data);
  } else if (data.isLeft) {
    console.log('User left the chat');
  }
});

// Send a message
socket.emit('send_message', {
  receiverId: 'RECEIVER_USER_ID',
  message: {
    text: 'Hello, how are you?'
  }
});

// Listen for sent message confirmation
socket.on('message_sent', (data) => {
  console.log('Message sent:', data);
});

// Listen for received messages
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});

// Get chat history (automatically marks messages as seen)
socket.emit('chat_message', { 
  receiverId: 'RECEIVER_USER_ID',
  keyword: 'search term' // optional
});

// Listen for chat history
socket.on('retrieve_message', (data) => {
  console.log('Chat history:', data.data);
});

// Get chat list with unread counts
socket.emit('get_chatlist', { keyword: 'search' }); // keyword is optional

socket.on('chatlist', (data) => {
  data.data.forEach(chat => {
    console.log(`Chat with ${chat.senderId.name}: ${chat.unreadCount} unread messages`);
  });
});

// Leave a chat
socket.emit('leave_chat', { receiverId: 'RECEIVER_USER_ID' });

socket.on('chat_status', (data) => {
  if (data.isLeft) {
    console.log('Left chat successfully');
  }
});

// Check online status
socket.emit('check_online_status', { receiverId: 'RECEIVER_USER_ID' });

socket.on('online_status', (data) => {
  console.log(`User is ${data.isOnline ? 'online' : 'offline'}`);
});

// Typing indicator
socket.emit('user_typing', {
  receiverId: 'RECEIVER_USER_ID',
  type: 'user_typing' // or 'stop_typing'
});

socket.on('typing_alert', (data) => {
  if (data.data.isTyping) {
    console.log('User is typing...');
  }
});

// Delete a message
socket.emit('delete_message', { messageId: 'MESSAGE_ID' });

socket.on('message_update', (data) => {
  console.log('Message deleted:', data);
});

// Error handling
socket.on('error_notify', (error) => {
  console.error('Socket error:', error);
});

// Disconnect
socket.emit('disconnect_user', {});
socket.on('leave', (data) => {
  console.log('Disconnected:', data);
});
```

### React Example

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatComponent({ userId, receiverId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3000', {
      extraHeaders: {
        token: userId
      }
    });

    setSocket(newSocket);

    // Join chat
    newSocket.emit('joinchat', { receiverId });

    // Listen for messages
    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data.data]);
    });

    // Listen for online status
    newSocket.on('online_status', (data) => {
      setIsOnline(data.isOnline);
    });

    // Cleanup
    return () => {
      newSocket.emit('leave_chat', { receiverId });
      newSocket.close();
    };
  }, [userId, receiverId]);

  const sendMessage = (text) => {
    socket?.emit('send_message', {
      receiverId,
      message: { text }
    });
  };

  return (
    <div>
      <div>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</div>
      {/* Chat UI */}
    </div>
  );
}
```

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

