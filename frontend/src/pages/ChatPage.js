import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

function ChatPage() {
  const [chats, setChats] = useState([]);
  const fetchChats = async () => {
    const response = await axios.get("/api/chat");
    const result = await response.data;
    setChats(result);
    console.log(result);
  };

  useEffect(() => {
    fetchChats();
  }, []);
  return (
    <div>
      {chats.map((chat) => (
        <div>{chat.chatName}</div>
      ))}
    </div>
  );
}

export default ChatPage;
