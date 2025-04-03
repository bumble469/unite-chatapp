import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, IconButton } from "@mui/material";
import { Brightness4, Brightness7, Chat } from "@mui/icons-material"; // Theme icons
import { useState } from "react";
import { lightTheme, darkTheme } from "./context/Theme/ThemeProvider.jsx"; // Import themes
import Home from "./pages/Home/index.jsx";
import Auth from "./pages/Auth/index.jsx";
import ChatPage from "./pages/Chat/index.jsx"; 
function App() {
  const [mode, setMode] = useState("light");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={mode === "light" ? lightTheme : darkTheme}>
      <CssBaseline />
      <IconButton
        sx={{ position: "absolute", top: 20, right: 15 }}
        onClick={toggleTheme}
        color="inherit"
      >
        {mode === "light" ? <Brightness4 /> : <Brightness7 />}
      </IconButton>

      <Router>
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
