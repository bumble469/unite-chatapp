import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Avatar,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import Sidebar from "./Components/sidebar";

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [members, setMembers] = useState([]);

  const fileInputRef = useRef();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/friends/${userId}`);
        const data = await res.json();
        const uniqueFriends = [...new Set(data.friends)];
        console.log("Unique friends:", uniqueFriends);
        setMembers(uniqueFriends);
      } catch (err) {
        console.error("Failed to load friends:", err);
      }
    };
  
    if (userId) {
      fetchFriends();
    }
  }, [userId]);
  

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    if (!messages[member.id]) {
      setMessages((prev) => ({ ...prev, [member.id]: [] }));
    }
  };

  const handleSendMessage = (text, isFile = false) => {
    if (selectedMember && text.trim()) {
      setMessages((prev) => ({
        ...prev,
        [selectedMember.id]: [
          ...prev[selectedMember.id],
          { text, sender: "You", isFile },
        ],
      }));
      setMessage("");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && selectedMember) {
      handleSendMessage(`📎 ${file.name}`, true);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters sx={{ height: "100vh", display: "flex" }}>
      <Grid container sx={{ height: "100vh", flexWrap: "nowrap" }}>
        {!isMobile && (
          <Grid item sm={4} md={3} sx={{ height: "100%", width: "30vw" }}>
            <Sidebar
              members={members}
              setMembers={setMembers}
              selectedMember={selectedMember}
              onSelect={handleSelectMember}
            />
          </Grid>
        )}

        <Grid
          item
          xs={12}
          sm={8}
          md={9}
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
            height: "100%",
            backgroundColor: theme.palette.background.default,
            width: "100vw",
          }}
        >
          {selectedMember ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  pb: 1,
                }}
              >
                <Avatar src={selectedMember.ProfilePhoto} sx={{ mr: 2 }} />
                <Typography variant="h6">Chat with {selectedMember.FirstName} {selectedMember.LastName}</Typography>
              </Box>

              <Paper
                sx={{
                  flexGrow: 1,
                  p: 2,
                  overflowY: "auto",
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {messages[selectedMember.id]?.length > 0 ? (
                  messages[selectedMember.id].map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: msg.sender === "You" ? "flex-end" : "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          display: "inline-block",
                          p: 1,
                          borderRadius: 2,
                          backgroundColor:
                            msg.sender === "You"
                              ? theme.palette.primary.main
                              : theme.palette.grey[300],
                          color: msg.sender === "You" ? "#fff" : theme.palette.text.primary,
                          maxWidth: "70%",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.text}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
                    No messages yet.
                  </Typography>
                )}
              </Paper>

              <Box sx={{ display: "flex", mt: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleFileUpload}
                        />
                        <IconButton onClick={() => fileInputRef.current.click()}>
                          <AttachFileIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ ml: 1, px: 3 }}
                  onClick={() => handleSendMessage(message)}
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center", mt: "40vh" }}>
              Select a member to start chatting
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
