// models/Message.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  user: { type: String, default: "Anonymous" },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
