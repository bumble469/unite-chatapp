import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogTitle, Button, ListItem, TextField,
  Box, Typography, Avatar, Paper, Divider
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";
import { toast } from 'react-toastify';
import { socket } from '../../../socket.jsx';
import useMediaQuery from '@mui/material/useMediaQuery';

const ChatRoomModal = ({ open, onClose, roomid }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isMembersCollapsed, setIsMembersCollapsed] = useState(false);
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomName, setRoomName] = useState(null);
  const [roomDescription, setRoomDescription] = useState(null);
  const userid = parseInt(localStorage.getItem("userId"));
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [createdBy, setCreatedBy] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messageContainerRef = useRef(null); 

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      setMessages([]);
    }
  }, [roomid, open]);  

  useEffect(() => {
    socket.once("roomCreated", (data) => {
      setCreatedBy(data.createdBy);
      setRoomMembers(data.members);
      setRoomName(data.roomName);
      setRoomDescription(data.description)
    });

    socket.on("roomInfo", (data) => {
      setRoomName(data.chatroomname);
      setRoomDescription(data.description)
    })

    socket.on("joinedRoomMembers", (members) => {
      setRoomMembers(members);
    });

    socket.on("leftRoomMembers", (members) => {
      setRoomMembers(members);
    });

    socket.on("receiveRoomMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    const handleBeforeUnload = () => {
      if (createdBy === userid) {
        handleDeleteRoom();
      } else {
        handleLeaveRoom();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      socket.off("roomCreated");
      socket.off("joinedRoomMembers");
      socket.off("leftRoomMembers");
      socket.off("receiveRoomMessage");
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [createdBy, userid, roomid]);

  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleDeleteRoom = () => {
    if (socket) {
      socket.emit('deleteRoom', roomid, userid);
      socket.once('deleteRoomResponse', (response) => {
        if (response.success) {
          toast.info(`Room Ended!`);
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
      socket.emit('leaveRoom', roomid, userid);
      socket.once('leftRoomResponse', (response) => {
        response.success
          ? (toast.info(`Room left!`), onClose())
          : toast.error(`Couldn't leave room!`);
      });
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return; 
    socket.emit("sendRoomMessage", roomid, userid, message);
    setMessage(""); 
  };

  const resetState = () => {
    setMessage([])
    setMessage('');
    setIsMembersCollapsed(false);
    setRoomMembers([]);
    setRoomName(null);
    setRoomDescription(null);
    setCreatedBy(null);
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
        <Typography variant="body1" sx={{ mb: 1, fontSize:{xs:'0.8rem', md:'1rem'} }}>{roomName}</Typography>
        <Typography variant="caption" color="text.secondary">Description: {roomDescription}</Typography>
        <Button
          onClick={createdBy === userid ? handleDeleteRoom : handleLeaveRoom}
          sx={{ position: 'absolute', top: 8, right: 8, fontSize:{xs:'0.7rem', md:'0.9rem'} }}
        >
          {createdBy === userid ? 'End Room' : 'Leave Room'}
        </Button>
      </DialogTitle>

      <DialogContent
        ref={messageContainerRef}
        sx={{
          backgroundColor: isDark ? theme.palette.background.default : '#fff',
          color: theme.palette.text.primary,
          pr: { xs: 0, sm: 2 },
          "&::-webkit-scrollbar": { width: "10px" },
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
          }}
        >
          <Box
            sx={{
              marginLeft: '-0.8rem',
              marginTop:1,
              overflowY: 'auto',
              borderRight: `1px solid ${theme.palette.divider}`,
              minHeight: isMobile ? '200px' : '300px',
              height: isMembersCollapsed ? 0 : 'auto',
              paddingBottom: isMembersCollapsed ? 0 : 2,
              transition: 'height 0.3s ease',
              "&::-webkit-scrollbar": { width: "10px" },
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
          <Divider
            sx={{
              display: { xs: 'block', md: 'none' }, // Only show on mobile
              mt: 2,
              mb: 1,
              borderColor: theme.palette.divider
            }}
          />
          {/* Right Section - Chat */}
          <Box
            flex={3}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            marginLeft={isMobile?"-1rem":""}
          >
            <Box
              display="flex"
              flexDirection="column"
              sx={{ gap: 1, overflowY: 'auto', height: '100%' }}
              ref={messageContainerRef}
            >
              {messages.map((msg, index) => {
                const isOwnMessage = msg.userid === userid;
                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                      mb: 1.5, 
                      px: 1,
                    }}
                  >
                    <Paper
                      elevation={3}
                      sx={{
                        maxWidth: '70%',
                        padding: 1,
                        borderRadius: 1.5,
                        background: isOwnMessage
                          ? "linear-gradient(135deg, rgb(36, 136, 194) 0%, hsl(203, 86.40%, 40.40%) 100%)"
                          : isDark
                          ? theme.palette.grey[800]
                          : "linear-gradient(135deg, rgb(214, 211, 211) 0%, #f5f5f5 100%)",
                        color: isOwnMessage ? '#fff' : theme.palette.text.primary,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          color: isOwnMessage ? '#e0e0e0' : theme.palette.text.secondary,
                          mb: 0.5,
                          fontSize:"0.7rem"
                        }}
                      >
                        {msg.username}
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          fontSize: '0.75rem',
                          opacity: 0.7,
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Paper>
                  </Box>
                );
              })}

            </Box>
            {/* Send Message Section */}
            <Box display="flex" alignItems="center" mt={2}>
              <TextField
                value={message}
                onChange={handleMessageChange}
                label="Type a message"
                multiline
                maxRows={4}
                sx={{ width: '100%', gap: 1 }}
              />
              <Button
                onClick={handleSendMessage}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  ml: 1,
                  padding: 1,  
                  minWidth: 'auto', 
                  width: 'auto', 
                  height: 'auto', 
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                <SendIcon sx={{ width:'1.5rem', height:'2rem' }} /> {/* Adjust icon size for compactness */}
              </Button>

            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatRoomModal;
