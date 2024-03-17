import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import "../styles.css";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const logoutHandler = () => {
    sessionStorage.removeItem("userInfo");
    navigate("/");
  };
  const toast = useToast();
  const handleSearch = (query) => {
    setSearch(query);
    if (query?.length < 1) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    axios
      .get(`/api/user?search=${query}`, config)
      .then((result) => {
        setSearchResults(result.data);
        setLoading(false);
      })
      .catch((err) => {
        toast({
          title: "Error Occured",
          description: err.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        });
        setLoading(false);
      });
  };
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.post(`/api/chat`, { userId }, config);
      const result = await response.data;
      if (chats?.find((chat) => chat._id === result._id)) setChats([result]);
      setSelectedChat(result);

      navigate(`/chats`);
      setLoadingChat(false);
      onClose();
    } catch (err) {
      toast({
        title: "Error Occured",
        description: err.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });

      setLoadingChat(false);
    }
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        bg="white"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search User to chat">
          <Button variant="ghost" colorScheme="teal" size="sm" onClick={onOpen}>
            <i class="fas fa-search" />

            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User to chat
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize={"2xl"} fontFamily="work sans" fontWeight="bold">
          Chat App
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <div
                className="notification-badge"
                style={{
                  display: `${notification.length === 0 ? "none" : "block"}`,
                }}
              >
                {notification.length ? notification.length : 0}
              </div>

              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>

            <MenuList>
              {!notification.length && "No new messages"}
              {console.log(notification)}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(
                      notification.filter(
                        (item) => item.chat._id === notif.chat._id
                      )
                    );
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New message in ${notif.chat.name} group chat`
                    : `New message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>Profile</MenuItem>
              </ProfileModal>

              <MenuDivider></MenuDivider>
              <MenuItem onClick={logoutHandler}>LogOut</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />

        <DrawerContent>
          <DrawerHeader
            borderBottomWidth="1px"
            display={"flex"}
            flexDir={"row"}
            justifyContent={"space-between"}
          >
            Search user
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={onClose}
            />
          </DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search User by name or email"
                mr={2}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Button onClick={handleSearch} isLoading={loadingChat}>
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResults?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
