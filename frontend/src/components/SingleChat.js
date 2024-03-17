import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { ArrowBackIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdatedGroupChatModal from "./miscellaneous/UpdatedGroupChatModal";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./UserAvatar/ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/type.json";

const ENDPOINT =
  process.env.ENDPOINT || "https://gsp-mern-chat-app.onrender.com";
var socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const toast = useToast();
  const sendMessage = (e) => {
    if (e.type === "click" || (e.key === "Enter" && newMessage !== "")) {
      socket.emit("stop typing", selectedChat?._id);
      const config = {
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      axios
        .post(
          "/api/message",
          { chatId: selectedChat?._id, content: newMessage },
          config
        )
        .then((res) => {
          setNewMessage("");
          socket.emit("new message", res.data);
          setMessages([...messages, res.data]);
        })
        .catch((err) => {
          toast({
            title: "Failed to send message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        });
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, [selectedChat]);
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare?._id !== newMessageRecieved.chat?._id
      ) {
        if (
          !notification?.find(
            (item) => item.chat._id === newMessageRecieved.chat._id
          )
        ) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    setLoading(false);

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    axios
      .get(`/api/message/${selectedChat._id}`, config)
      .then((res) => {
        setMessages(res.data);
        setLoading(true);
        setNotification(
          notification.filter((item) => item.chat._id !== selectedChat._id)
        );
        socket.emit("join chat", selectedChat._id);
      })
      .catch((err) => {
        toast({
          title: "Failed to fetch messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      });
  };
  React.useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat, fetchAgain]);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "32px" }}
            fontFamily={"Work sans"}
            pb={3}
            px={2}
            w={"100%"}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => {
                setSelectedChat(null);
              }}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat?.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                {
                  <UpdatedGroupChatModal
                    chat={selectedChat}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                }
              </>
            )}
          </Text>

          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"flex-end"}
            w={"100%"}
            h={"100%"}
            p={3}
            borderRadius={"lg"}
            overflow={"hidden"}
            bg={"#e8e8e8"}
          >
            {!loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            {isTyping ? (
              <div style={{ margin: 3 }}>
                <Lottie
                  options={defaultOptions}
                  width={70}
                  height={20}
                  style={{ marginLeft: 0 }}
                />
              </div>
            ) : (
              <></>
            )}
            <FormControl
              display="flex"
              mt={3}
              isRequired
              onKeyDown={sendMessage}
            >
              <Input
                placeholder="Type a message"
                value={newMessage}
                onChange={typingHandler}
                onSubmit={sendMessage}
              />
              <Button colorScheme="teal" onClick={sendMessage}>
                <ArrowUpIcon></ArrowUpIcon>
              </Button>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          h={"100%"}
        >
          <Text fontSize={"3xl"} pb={3} fontFamily={"Work sans"}>
            Clik on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;
