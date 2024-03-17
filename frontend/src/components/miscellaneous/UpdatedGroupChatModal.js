import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";

import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";

function UpdatedGroupChatModal({ fetchAgain, setFetchAgain, fetchMessages }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only Admin can remove someone",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    axios
      .put(
        "/api/chat/groupremove",
        { chatId: selectedChat._id, userId: user1._id },
        config
      )
      .then((res) => {
        user._id === user1._id
          ? setSelectedChat(null)
          : setSelectedChat(res.data);
        setFetchAgain(!fetchAgain);
        fetchMessages();
        setLoading(false);
      })
      .catch((err) => {
        toast({
          title: "Error occured",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      });
  };
  const handleRename = () => {
    if (groupChatName.length < 1 || groupChatName === selectedChat.chatName) {
      return;
    }

    setRenameLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    axios
      .put(
        `/api/chat/rename`,
        { chatId: selectedChat._id, newName: groupChatName },
        config
      )
      .then((result) => {
        setSelectedChat(result.data);
        setFetchAgain(!fetchAgain);
        setRenameLoading(false);
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
        setRenameLoading(false);
      });
    setGroupChatName("");
  };
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
  const handleAddUser = (user1) => {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only Admin can add someone",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User already in the goup",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    axios
      .put(
        "/api/chat/groupadd",
        { chatId: selectedChat._id, userId: user1._id },
        config
      )
      .then((res) => {
        setSelectedChat(res.data);
        setFetchAgain(!fetchAgain);
        setLoading(false);
      })
      .catch((err) => {
        toast({
          title: "Error occured",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      });
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            {selectedChat?.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w={"100%"} display={"flex"} flexWrap={"wrap"} pb={2}>
              {selectedChat?.users.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => {
                    handleRemove(user);
                  }}
                />
              ))}
            </Box>
            <FormControl display={"flex"} justifyContent={"center"} pb={3}>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant={"solid"}
                colorScheme={"teal"}
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Rename
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Members"
                mb={1}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size={"lg"} />
            ) : (
              searchResults?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default UpdatedGroupChatModal;
