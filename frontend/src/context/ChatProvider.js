const { createContext, useContext, useState } = require("react");

const ChatContext = createContext();
const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState([]);
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);

  const [notification, setNotification] = useState([]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        setChats,
        chats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
