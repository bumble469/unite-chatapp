import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material"; // Theme icons
import { useState } from "react";
import { lightTheme, darkTheme } from "./context/Theme/ThemeProvider"; // Import themes
import Home from "./pages/Home/index.jsx";
import Auth from "./pages/Auth/index.jsx";
import ChatPage from "./pages/Chat/index.jsx";
import Header from "./components/Header.jsx"; // Import Header

function App() {
  const [mode, setMode] = useState("light");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={mode === "light" ? lightTheme : darkTheme}>
      <CssBaseline />

      <Router>
        <Header mode={mode} setMode={setMode} />
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
