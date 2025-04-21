import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useState, useEffect } from "react"; // Ensure useEffect is imported
import { lightTheme, darkTheme } from "./context/Theme/ThemeProvider"; // Import themes
import Home from "./pages/Home/index.jsx";
import Auth from "./pages/Auth/index.jsx";
import ChatPage from "./pages/Chat/index.jsx";
import Header from "./components/Header.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { socket } from './socket.jsx';

function App() {
  const [mode, setMode] = useState("light");
  const userId = parseInt(localStorage.getItem("userId"));
  useEffect(() => {
    if (userId && !socket.connected) {
      socket.connect();

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        socket.emit("join", userId);
      });
    }
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      socket.off("connect"); 
    };
  }, [userId]);

  return (
    <ThemeProvider theme={mode === "light" ? lightTheme : darkTheme}>
      <CssBaseline />
      <Router>
        <Header mode={mode} setMode={setMode} />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
