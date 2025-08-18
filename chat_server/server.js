const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./db"); // Import DB connection
const Message = require("./models/Message"); // Import Model

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB();

io.on("connection", async (socket) => {
  console.log("✅ A user connected:", socket.id);

  // Send last 10 messages when a new client connects
  const messages = await Message.find().sort({ timestamp: -1 }).limit(10);
  socket.emit("load_messages", messages.reverse());

  // Listen for new message
  socket.on("send_message", async (data) => {
    const newMsg = new Message({ text: data });
    await newMsg.save();

    io.emit("receive_message", newMsg); // Send to all clients
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
