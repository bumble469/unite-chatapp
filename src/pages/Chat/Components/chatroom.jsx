import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button,
  List, ListItem, ListItemText, TextField, IconButton,
  Box, Typography, Avatar, Paper
} from '@mui/material';
import { useTheme } from "@mui/material/styles";
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const ChatRoomModal = ({ open, onClose, roomName, roomDescription, createdBy, socket: propSocket }) => {
  const [selected, setSelected] = useState(false);
  const [message, setMessage] = useState('');
  const [isMembersCollapsed, setIsMembersCollapsed] = useState(false);
  const [roomMembers, setRoomMembers] = useState([]);
  const userid = parseInt(localStorage.getItem("userId"));
  const apiUrl = import.meta.env.VITE_API_URL;
  const theme = useTheme();
  const socket = propSocket || io(apiUrl);
  const [file, setFile] = useState(null);
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (socket) {
      socket.on('onCreateRoomMembers', (members) => setRoomMembers(members));
      socket.on('joinedRoomMembers', (members) => setRoomMembers(members));
      socket.on('leftRoomMembers', (members) => setRoomMembers(members));
    }

    const handleBeforeUnload = (e) => {
      if (socket) {
        if (createdBy === userid) {
          socket.emit('deleteRoom', roomName, userid);
          socket.on('deleteRoomResponse', (response) => {
            if (response.success) {
              toast.info(`Room deleted: ${response.message}`);
            } else {
              toast.error(`Failed to delete room: ${response.message}`);
            }
          });
        } else {
          socket.emit('leaveRoom', roomName, userid);
          socket.once('leftRoomResponse', (response) => {
            if (response.success) {
              toast.info(`Room left: ${response.message}`);
            } else {
              toast.error(`Couldn't leave room: ${response.message}`);
            }
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('onCreateRoomMembers');
      socket.off('joinedRoomMembers');
      socket.off('leftRoomMembers');
    };
  }, [socket, roomName, userid, createdBy]);

  const [messages, setMessages] = useState({}); // { roomId: [msg, msg, ...] }

  useEffect(() => {
    if (!socket) return;
  
    socket.on("newRoomMessage", (msg) => {
      console.log("📥 Received message:", msg);
  
      const {
        roommessageid,
        senderid,
        messagetext,
        sentat,
        isFile,
        fileData,
        roomId,
      } = msg;
  
      const safeText = messagetext || "download.bin";
  
      setMessages((prevMessages) => ({
        ...prevMessages,
        [roomId]: [
          ...(prevMessages[roomId] || []),
          {
            text: safeText,
            sender: "Other",
            isFile: !!isFile,
            fileData: isFile ? fileData : null,
            fileName: isFile ? safeText : null,
            sentat,
          },
        ],
      }));
    });
  
    return () => {
      socket.off("newRoomMessage");
    };
  }, []);
  

  const handleMessageChange = (e) => setMessage(e.target.value);

  const toggleMembersList = () => setIsMembersCollapsed(!isMembersCollapsed);

  const handleDeleteRoom = () => {
    if (socket) {
      socket.emit('deleteRoom', roomName, userid);
      socket.on('deleteRoomResponse', (response) => {
        if (response.success) {
          toast.info(`Delete Response: ${response.message}`);
          onClose();
          resetState();
        } else {
          toast.error(`Delete Failed: ${response.message}`);
        }
      });
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leaveRoom', roomName, userid);
      socket.once('leftRoomResponse', (response) => {
        response.success
          ? (toast.info(`Room left: ${response.message}`), onClose(), resetState())
          : toast.error(`Couldn't leave room: ${response.message}`);
      });
    }
  };

  const handleSendMessage = () => {
    if (!message && !file) {
      toast.error('Message cannot be empty');
      return;
    }
  
    // Construct the message data to be sent
    const messageData = {
      roomName,
      senderId: userid,  // Assuming `userid` is the user sending the message
      messageText: message,
      isFile: !!file,
      fileData: file ? file : null
    };
  
    // Emit the message event to the backend
    socket.emit('roomSendMessage', messageData);
  
    // Optionally, add the message to the local state for instant UI update
    setMessages((prevMessages) => ({
      ...prevMessages,
      [roomName]: [
        ...(prevMessages[roomName] || []),
        { senderid: userid, messagetext: message, sentat: new Date().toISOString(), isFile: !!file, fileData: file }
      ]
    }));
  
    // Reset the message input and file state after sending
    setMessage('');
    setFile(null);
  };
  
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };  
  
  const resetState = () => {
    setSelected(false);
    setMessage('');
    setIsMembersCollapsed(false);
    setRoomMembers([]);
  };
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') onClose();
      }}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle
        sx={{
          position: 'relative',
          backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.grey[100],
          color: theme.palette.text.primary,
        }}
      >
        <Typography variant="body1" sx={{ mb: 1 }}>{roomName}</Typography>
        <Typography variant="caption" color="text.secondary">Description: {roomDescription}</Typography>
        <Button
          onClick={createdBy === userid ? handleDeleteRoom : handleLeaveRoom}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          {createdBy === userid ? 'End Room' : 'Leave Room'}
        </Button>
      </DialogTitle>
  
      <DialogContent
        sx={{
          backgroundColor: isDark ? theme.palette.background.default : '#fff',
          color: theme.palette.text.primary,
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: theme.palette.mode === "dark" ? "#333" : "#f0f0f0",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.mode === "dark" ? "rgb(207, 207, 207)" : "rgb(125, 125, 125)",
            borderRadius: "10px",
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme.palette.mode === "dark" ? "#2a8c8d" : "#0056b3",
          },
        }}
      >
        <Box
          display="flex"
          sx={{
            flexDirection: { xs: 'column', sm: 'column', md: 'row' },
            gap: 1,
            height: { xs: '85vh', sm: '70vh' },
            padding: 1,
          }}
        >
          {/* Left Section - Members */}
          <Box
            sx={{
              marginLeft: '-1rem',
              overflowY: 'auto',
              borderRight: `1px solid ${theme.palette.divider}`,
              height: isMembersCollapsed ? 0 : 'auto',
              paddingBottom: isMembersCollapsed ? 0 : 2,
              transition: 'height 0.3s ease',
              "&::-webkit-scrollbar": {
                width: "10px",
              },
              "&::-webkit-scrollbar-track": {
                background: theme.palette.mode === "dark" ? "#333" : "#f0f0f0",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: theme.palette.mode === "dark" ? "rgb(207, 207, 207)" : "rgb(125, 125, 125)",
                borderRadius: "10px",
                border: "2px solid transparent",
                backgroundClip: "content-box",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: theme.palette.mode === "dark" ? "#2a8c8d" : "#0056b3",
              },
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>Members</Typography>

            {roomMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No members to show</Typography>
            ) : (
              <Box sx={{ display: isMembersCollapsed ? 'none' : 'block', px: 1 }}>
                {roomMembers.map((member, index) => (
                  <Paper
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.2,
                      mb: 1.5,
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === "dark" ? "rgb(35, 35, 35)" : "rgb(235, 235, 235)",
                      color: theme.palette.text.primary,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Avatar sx={{ mr: 2 }} src={member.profilephoto}>
                      {member.firstname?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{member.firstname} {member.lastname}</Typography>
                      <Typography variant="caption" color="text.secondary">({member.username})</Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>

          {/* Right Section - Chat */}
          <Box
            flex={3}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            sx={{
              backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.grey[50],
              px: 2,
              pb: 2,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Box
              flex={1}
              sx={{
                overflowY: 'auto',
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1,
                mb: 1,
              }}
            >
              {/* Render the messages here */}
              {messages[roomName]?.map((msg, index) => (
                <Box key={index} sx={{ marginBottom: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {msg.senderid} {/* You can display sender's name or id here */}
                  </Typography>
                  <Typography variant="body1">{msg.messagetext}</Typography>
                  {msg.isFile && <a href={msg.fileData} target="_blank" rel="noopener noreferrer">Download File</a>}
                  <Typography variant="caption" color="text.secondary">{new Date(msg.sentat).toLocaleTimeString()}</Typography>
                </Box>
              ))}
            </Box>

            <Box display="flex" alignItems="center" gap={2} sx={{
              flexDirection: { xs: 'column', md: 'row' },
            }}>
              <TextField
                fullWidth
                variant="outlined"
                value={message}
                onChange={handleMessageChange}
                placeholder="Type a message"
                sx={{
                  input: { color: theme.palette.text.primary },
                  backgroundColor: isDark ? theme.palette.grey[800] : '#fff',
                  borderRadius: 2,
                }}
              />

              <input
                type="file"
                onChange={handleFileChange}
                style={{
                  display: 'none',
                }}
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button variant="contained" component="span">
                  Upload File
                </Button>
              </label>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                sx={{ px: 4 }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );  
};

export default ChatRoomModal;
