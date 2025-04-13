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
import ArrowUpIcon from '@mui/icons-material/ArrowUpward';
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import Sidebar from "./Components/sidebar";
import { getSocket } from "./Components/sidebar";
import axios from "axios";

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const socket = getSocket();
  const [chatId, setChatId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [members, setMembers] = useState([]);
  const fileInputRef = useRef();
  const userId = parseInt(localStorage.getItem("userId"), 10);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (!socket) return;
  
    // Listener for receiving messages
    socket.on("receiveMessage", (msg) => {
      console.log("Received message:", msg);
  
      const { senderId, text, isFile, chatId: newChatId } = msg;
  
      // Only update state if the message is for the selected chat (selectedMember and chatId should match)
      if (selectedMember?.id === senderId || chatId === newChatId) {
        setMessages((prevMessages) => {
          const updatedMessages = {
            ...prevMessages, // Keep the existing messages
            [selectedMember.id]: [
              ...(prevMessages[selectedMember.id] || []), // Append the new message to the existing messages
              { text, sender: "Other", isFile },
            ],
          };
  
          return updatedMessages;
        });
      }
    });
  
    // Cleanup socket listener
    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, selectedMember?.id, chatId]);

  
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

  useEffect(() => {
    if (!selectedMember || !chatId) return;
    const fetchChatHistory = async () => {
      try {
        const res = await axios.post(`http://localhost:5000/api/chat/chat-history`, {
          chatId: chatId,
          userId: userId,
        });
        const data = await res.data; // You can directly access the response data here
        const messagesData = data.messages.map((msg) => ({
          text: msg.MessageText,
          sender: msg.SenderID === userId ? "You" : "Other",
          timestamp: msg.SentAt,
        }));
        
        setMessages((prev) => ({
          ...prev,
          [selectedMember.id]: messagesData, // Store messages for selected member
        }));
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
  
    fetchChatHistory();
  }, [chatId]);  

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    if (!messages[member.id]) {
      setMessages((prev) => ({
        ...prev,
        [member.id]: [],
      }));
    }
  };  

  const handleSendMessage = (text, isFile = false) => {
    if (selectedMember && text.trim()) {
      const newMessage = {
        text,
        senderId: userId,
        receiverId: selectedMember.UserID,
        isFile,
        timestamp: Date.now(),
        chatId: chatId,
      };

      socket.emit("sendMessage", newMessage);

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
  
  const messageContainerRef = useRef(null);

  useEffect(() => {
    const messageContainer = messageContainerRef.current;
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages[selectedMember?.id]]);


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && selectedMember) {
      handleSendMessage(`📎 ${file.name}`, true);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters sx={{ height: "100vh", display: "flex" }}>
  <Grid container sx={{ height: "100vh", flexWrap: "nowrap" }}>
    <Grid
      item
      sx={{
        display: "flex",
        position: isMobile ? "fixed" : "relative",
        bottom: 0,
        left: 0,
        zIndex: isMobile ? 1300 : 1200,
        width: isMobile ? "100vw" : "auto",
        height: isMobile ? "80vh" : "auto",
        backgroundColor: isMobile ? theme.palette.background.paper : "transparent",
        transform: isMobile
          ? selectedMember
            ? "translateY(100%)"
            : "translateY(0%)"
          : "none",
        transition: isMobile ? "transform 0.4s ease-in-out" : "none",
        mr: isMobile ? 0 : 2.5,
        ml: {
          xs: 0,
          sm: "0.8rem",
          md: "1rem",
          lg: "1.5rem",
        },
        borderTopLeftRadius: isMobile ? 10 : 0,
        borderTopRightRadius: isMobile ? 10 : 0,
        boxShadow: isMobile ? "0 -4px 20px rgba(0,0,0,0.2)" : "none",
        overflow: isMobile ? "hidden" : "initial",
      }}
    >
      <Sidebar
        members={members}
        setMembers={setMembers}
        selectedMember={selectedMember}
        onSelect={handleSelectMember}
        setChatId={setChatId}
        setChatHistory={setMessages}
      />
    </Grid>

    {(!isMobile || (isMobile && selectedMember)) && (
      <Grid
        item
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
            {isMobile && (
              <>
                {selectedMember && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowUpIcon />}
                      onClick={() => setSelectedMember(null)}
                      sx={{
                        mb: 2,
                        alignSelf: 'flex-start',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          borderColor: 'primary.main',
                        },
                        mr: 1,
                      }}
                    >
                      List
                    </Button>
                  </Box>
                )}
              </>
            )}


            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  transform: {
                    xs: "scale(0.8)",
                    sm: "scale(0.9)",
                    md: "scale(1)",
                  },
                  transformOrigin: "left center",
                }}
              >
                <Avatar src={selectedMember.ProfilePhoto} sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ maxWidth: { xs: "fit-content", sm: "200px" } }}>
                  {selectedMember.FirstName} {selectedMember.LastName}
                </Typography>
              </Box>
            </Box>

            <Paper
              sx={{
                flexGrow: 1,
                p: 2,
                overflowY: "auto",
                backgroundColor: theme.palette.background.paper,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                id="message-container"
                ref={messageContainerRef}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {messages[selectedMember.id]?.length > 0 ? (
                  messages[selectedMember.id].map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                        backgroundColor: msg.sender === "You" ? "#82C8E5" : "#D3D3D3",
                        color: "#000",
                        px: 1,
                        py: 1,
                        borderRadius: 2,
                        maxWidth: "70%",
                        boxShadow: 2,
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: 8,
                          width: 0,
                          height: 0,
                          border: "6px solid transparent",
                          ...(msg.sender === "You"
                            ? {
                                right: -12,
                                borderLeftColor: "#82C8E5",
                              }
                            : {
                                left: -12,
                                borderRightColor: "#D3D3D3",
                              }),
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
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
              </Box>
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
          !isMobile && (
            <Typography variant="h6" sx={{ textAlign: "center", mt: "40vh" }}>
              Select a member to start chatting
            </Typography>
          )
        )}
      </Grid>
    )}
  </Grid>
</Container>

  );  
};

export default Chat;
