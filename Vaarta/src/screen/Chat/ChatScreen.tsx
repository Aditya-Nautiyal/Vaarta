import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import io from "socket.io-client";

// Connect to Socket.IO backend
// ⚠️ NOTE: 
// If using Android Emulator -> use "http://10.0.2.2:4000"
// If using iOS Simulator -> use "http://localhost:4000"
// If using a real device -> replace with your computer's local IP (e.g., http://192.168.1.5:4000)
const socket = io("http://10.0.2.2:4000");

export default function ChatScreen() {
  const [message, setMessage] = useState(""); // Store input message
  const [chat, setChat] = useState([]); // Store all chat messages

  useEffect(() => {
  socket.on("load_messages", (msgs) => {
    setChat(msgs.map(m => m.text)); // load chat history
  });

  socket.on("receive_message", (data) => {
    setChat((prev) => [...prev, data.text]);
  });

  return () => {
    socket.off("load_messages");
    socket.off("receive_message");
  };
}, []);


  // Send message to server
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", message); // Emit event to server
      setMessage(""); // Clear input box
    }
  };

  return (
    <View style={styles.container}>
      {/* Chat Messages */}
      <FlatList
        data={chat}
        renderItem={({ item }) => <Text style={styles.msg}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Input Box */}
      <TextInput
        style={styles.input}
        placeholder="Type message..."
        value={message}
        onChangeText={setMessage}
      />

      {/* Send Button */}
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  msg: {
    fontSize: 16,
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 5,
    marginVertical: 2,
  },
});
