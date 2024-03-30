import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import axios from "axios";
import { useEffect } from "react";

const visitEndpoint = "https://gsp-server.onrender.com";
function App() {
  useEffect(() => {
    if (sessionStorage.getItem("visit")) {
      console.log("visited");
    } else {
      const data = {
        webSiteName: "chat-app",
        count: 1,
      };
      axios
        .post(`${visitEndpoint}/visit`, { data })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    sessionStorage.setItem("visit", true);
  }, []);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
