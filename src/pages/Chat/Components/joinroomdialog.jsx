import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, Radio, RadioGroup, FormControlLabel, TextField,
  Box, Typography, List, ListItem, ListItemText
} from '@mui/material';
import ChatRoomModal from './chatroom';
import { useTheme } from "@mui/material/styles";
import {socket} from '../../../socket.jsx';
const JoinRoomDialog = ({ open, onClose}) => {
  const [roomType, setRoomType] = useState('public');
  const [roomName, setRoomName] = useState('');
  const [openRooms, setOpenRooms] = useState([]);
  const [privateRoom, setPrivateRoom] = useState(null);
  const [privateRoomError, setPrivateRoomError] = useState('');
  const [chatRoomOpen, setChatRoomOpen] = useState(false);
  const [joinedRoomName, setJoinedRoomName] = useState('');
  const userid = parseInt(localStorage.getItem("userId"));
  const theme = useTheme();
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchPublicRooms = async () => {
    if (roomType === 'public') {
      try {
        const res = await axios.post(`${apiUrl}/api/rooms/public-rooms`);
        setOpenRooms(res.data.rooms || []);
      } catch (err) {
        console.error('Error fetching public rooms:', err);
      }
    }
  };

  useEffect(() => {
    fetchPublicRooms();
  }, [roomType]);

  const handleRefreshRooms = () => {
    fetchPublicRooms();
  };

  const handleJoinRoom = (room) => {
    if (room?.roomid && userid && socket) {
      socket.emit('joinRoom', room.roomid, userid);
      setJoinedRoomId(room.roomid)
      setJoinedRoomName(room.chatroomname);
      setChatRoomOpen(true);
      setOpenRooms([]);
      onClose();
    }
  };

  const handlePrivateRoomSearch = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/rooms/private-rooms`, {
        roomName
      });

      if (res.data.rooms?.length > 0) {
        setPrivateRoom(res.data.rooms[0]);
        setPrivateRoomError('');
      } else {
        setPrivateRoom(null);
        setPrivateRoomError('Room not found.');
      }
    } catch (err) {
      console.error('Error fetching private room:', err);
      setPrivateRoom(null);
      setPrivateRoomError('Room not found.');
    }
  };

  const handleCancel = () => {
    setRoomType('public');
    setRoomName('');
    setPrivateRoom(null);
    setPrivateRoomError('');
    onClose();
  };

  const handleCloseChatRoom = () => setChatRoomOpen(false);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Join Room</DialogTitle>
        <DialogContent>
          <RadioGroup value={roomType} onChange={(e) => setRoomType(e.target.value)} row>
            <FormControlLabel value="public" control={<Radio />} label="Public Room" />
            <FormControlLabel value="private" control={<Radio />} label="Private Room" />
          </RadioGroup>

          {roomType === 'public' ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">Available Public Rooms</Typography>
                <Button variant="outlined" size="small" onClick={handleRefreshRooms}>
                  Refresh
                </Button>
              </Box>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <List>
                  {openRooms.map((room, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderRadius: 2,
                        boxShadow: 1,
                        mb: 1,
                        p: 2,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === "dark" ? 'rgb(46, 46, 46)' : 'rgb(215, 219, 216)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <>
                            <Typography variant="caption" color="primary">Public</Typography> {room.chatroomname}
                          </>
                        }
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleJoinRoom(room)}
                      >
                        Join
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="Enter Private Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                sx={{ mt: 2 }}
                helperText="Please enter the exact room name"
              />
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={handlePrivateRoomSearch}
              >
                Search
              </Button>
              {privateRoomError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {privateRoomError}
                </Typography>
              )}

              {privateRoom && !privateRoomError && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    <ListItem
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderRadius: 2,
                        boxShadow: 1,
                        mb: 1,
                        p: 2,
                        backgroundColor: '#f9f9f9',
                        '&:hover': {
                          backgroundColor: '#eee',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <>
                            <Typography variant="caption" color="error">Private</Typography> {privateRoom.chatroomname}
                          </>
                        }
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleJoinRoom(privateRoom)}
                      >
                        Join
                      </Button>
                    </ListItem>
                  </List>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <ChatRoomModal
        open={chatRoomOpen}
        onClose={handleCloseChatRoom}
        theme={{
          palette: {
            background: { default: '#f5f5f5', paper: '#fff' },
            text: { primary: '#000' },
            error: { main: '#d32f2f' },
            divider: '#e0e0e0',
          },
        }}
        roomid = {joinedRoomId}
      />
    </>
  );
};

export default JoinRoomDialog;
