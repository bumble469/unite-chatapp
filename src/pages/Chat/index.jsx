import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Grid,
  Button,
  Typography,
  Container,
  useMediaQuery,
} from "@mui/material";
import ArrowUpIcon from '@mui/icons-material/ArrowUpward';
import Sidebar from "./Components/sidebar";
import { getSocket } from "./Components/sidebar";
import axios from "axios";
import ChatMessages from "./Components/chatmessages";
import ChatHeader from './Components/chatheader';
import ChatInput from './Components/chatinput';
const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const socket = getSocket();
  const [chatId, setChatId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [members, setMembers] = useState([]);
  const userId = parseInt(localStorage.getItem("userId"), 10);
  const messageContainerRef = useRef(null);
  
  useEffect(() => {
    if (!socket) return;
    socket.on("receiveMessage", (msg) => {
      console.log("Received message:", msg);
      const { senderId, text, isFile, chatId: newChatId } = msg;
      if (selectedMember?.id === senderId || chatId === newChatId) {
        setMessages((prevMessages) => {
          const updatedMessages = {
            ...prevMessages, 
            [selectedMember.id]: [
              ...(prevMessages[selectedMember.id] || []),
              { text, sender: "Other", isFile },
            ],
          };
          return updatedMessages;
        });
      }
    });
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
        const data = await res.data;
        const messagesData = data.messages.map((msg) => ({
          text: msg.MessageText,
          sender: msg.SenderID === userId ? "You" : "Other",
          timestamp: msg.SentAt,
        }));
        
        setMessages((prev) => ({
          ...prev,
          [selectedMember.id]: messagesData,
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

  const handleSendMessage = (text, isFile = false, file = null) => {
    if (selectedMember && text.trim()) {
      const newMessage = {
        text,
        senderId: userId,
        receiverId: selectedMember.UserID,
        isFile,
        timestamp: Date.now(),
        chatId: chatId,
      };
  
      // If the message is a file, convert the file to Base64 and include it in the message
      if (isFile && file) {
        fileToBase64(file).then((base64File) => {
          newMessage.fileData = base64File; // Add the Base64 string to the message
  
          // Send the message through the WebSocket
          socket.emit("sendMessage", newMessage);
  
          // Update the state with the new message
          setMessages((prev) => ({
            ...prev,
            [selectedMember.id]: [
              ...prev[selectedMember.id],
              { text: `📎 ${file.name}`, sender: "You", isFile, fileData: base64File },
            ],
          }));
          setMessage(""); // Reset the input field
        }).catch((error) => {
          console.error("Error converting file to Base64:", error);
        });
      } else {
        // If it's just a text message, send it directly
        socket.emit("sendMessage", newMessage);
  
        setMessages((prev) => ({
          ...prev,
          [selectedMember.id]: [
            ...prev[selectedMember.id],
            { text, sender: "You", isFile },
          ],
        }));
        setMessage(""); // Reset the input field
      }
    }
  };
  
  // Helper function to convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Strip off the data URL part
      reader.onerror = reject;
    });
  };  
  
  useEffect(() => {
    const messageContainer = messageContainerRef.current;
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages[selectedMember?.id]]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && selectedMember) {
      handleSendMessage(`📎 ${file.name}`, true, file);
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
                <ChatHeader selectedMember={selectedMember} theme={theme} />
                <ChatMessages
                  messages={messages}
                  selectedMember={selectedMember}
                  messageContainerRef={messageContainerRef}
                  theme={theme}
                />
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleFileUpload={handleFileUpload}
                />
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
