import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, List, ListItem, ListItemText, TextField, IconButton, Box, Typography } from '@mui/material';
import { ArrowDropDown, ArrowDropUp, Menu as MenuIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
const ChatRoomModal = ({ open, onClose, members, theme, roomName, roomDescription ,socket, createdBy }) => {
  const [selected, setSelected] = useState(false); 
  const [message, setMessage] = useState('');
  const [isMembersCollapsed, setIsMembersCollapsed] = useState(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const userid = parseInt(localStorage.getItem("userId"));

  const handleCheckboxChange = () => {
    setSelected(!selected);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    console.log('Message Sent:', message);
    setMessage('');
  };

  const toggleMembersList = () => {
    setIsMembersCollapsed(!isMembersCollapsed); 
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); 
  };

  const handleDeleteRoom = () => {
    socket.emit('deleteRoom', roomName, userid);
    socket.on('deleteRoomResponse', (response) => {
      if (response.success) {
        toast.info(`Delete Response: ${response.message}`);  
        onClose();  
        setSelected(false);  
        setMessage(''); 
        setIsMembersCollapsed(false); 
        setIsMenuOpen(false);  
        onClose()
      } else {
        toast.error(`Delete Failed: ${response.message}`);
      }
    }); 
    return () => {
      socket.off('deleteRoomResponse');
    };
  }

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', roomName, userid);
    socket.on('leftRoomResponse', (response) => {
      if (response.success) {
        toast.info(`Room left: ${response.message}`);  
        onClose();  
        setSelected(false);  
        setMessage(''); 
        setIsMembersCollapsed(false); 
        setIsMenuOpen(false);  
        onClose()
      } else {
        toast.error(`Couldn't Leave room: ${response.message}`);
      }
    }); 
    return () => {
      socket.off('memberLeft');
    };
  };
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ position: 'relative' }}>
        <Typography variant="h6" sx={{ marginBottom: 1 }}>{roomName}</Typography>
        <Typography variant="caption" color="textSecondary">Description: {roomDescription}</Typography>
        {createdBy === userid ? (
          <Button onClick={handleDeleteRoom} sx={{ position: 'absolute', top: 8, right: 8 }}>
            End Room
          </Button>
        ) : (
          <Button onClick={handleLeaveRoom} sx={{ position: 'absolute', top: 8, right: 8 }}>
            Leave Room
          </Button>
        )}
      </DialogTitle>

      <DialogContent>
        <Box
          display="flex"
          sx={{
            flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on small screens
            gap: 2,
            height: '400px',
            color: theme.palette.text.primary,
            padding: 2,
          }}
        >
          {/* Left Section: Members List (Collapsible on Mobile) */}
          <Box
            flex={1}
            sx={{
              width: { xs: '100%', sm: '15%', lg: '15%' }, // Members list takes 25% width on small screens, 20% on large screens
              overflowY: 'auto',
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: 'height 0.3s ease', // Smooth sliding transition
              height: isMembersCollapsed ? 0 : 'auto', // Slide up when collapsed, slide down when expanded
              paddingBottom: isMembersCollapsed ? 0 : 2, // Adjust padding accordingly
            }}
          >
            <Box sx={{ display: { xs: 'block', sm: 'none' }, textAlign: 'right', marginBottom: 1 }}>
              <IconButton onClick={toggleMenu}>
                <MenuIcon />
              </IconButton>
            </Box>

            <Typography variant="h6" sx={{ marginBottom: 2 }}>Members</Typography>
            <List sx={{ display: isMembersCollapsed ? 'none' : 'block' }}>
              {members.map((member, index) => (
                <ListItem key={index}>
                  <ListItemText primary={member} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box
            flex={3}  // Ensuring the chatbox takes more space
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            sx={{
              backgroundColor: theme.palette.background.paper,
              paddingLeft: 2,
              paddingRight: 2,
              paddingBottom: 2,
              boxShadow: 3,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Box
              flex={1}
              sx={{
                overflowY: 'auto',
                borderBottom: `1px solid ${theme.palette.divider}`,
                paddingBottom: 1,
                marginBottom: 1,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                Chat messages will appear here...
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                fullWidth
                variant="outlined"
                value={message}
                onChange={handleMessageChange}
                placeholder="Type a message"
                sx={{ borderRadius: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                sx={{ paddingLeft: 4, paddingRight: 4 }}
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
