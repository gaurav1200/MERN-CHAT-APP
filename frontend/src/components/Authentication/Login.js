import { FormControl, VStack, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { Button, FormLabel, Input } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../context/ChatProvider";

function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const { setUser } = ChatState();
  const navigate = useNavigate();

  const toast = useToast();
  // const instance = axios.create({
  //   baseURL: "http://localhost:5000",
  // });
  const submitHandler = () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please enter all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    axios
      .post("/api/user/login", { email, password }, config)
      .then((response) => {
        sessionStorage.setItem("userInfo", JSON.stringify(response.data));
        // localStorage.setItem("userInfo", JSON.stringify(response.data));
        setUser(response.data);
        navigate("/chats");
      })
      .catch((err) => {
        toast({
          title: "Invalid email or password",
          description: err.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      });
  };

  return (
    <VStack spacing="5px">
      <FormControl id="emailLogin" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          placeholder="Entere your Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="passwordlogin" isRequired>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          placeholder="Entere your password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
      {/* <Button
        colorScheme="red"
        variant="solid"
        width="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("12345678");
        }}
        isLoading={loading}
      >
        Get guest user credentials
      </Button> */}
    </VStack>
  );
}

export default Login;
