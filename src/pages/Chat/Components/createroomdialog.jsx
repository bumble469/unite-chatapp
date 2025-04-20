import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, Radio, RadioGroup, FormControlLabel, TextField
} from '@mui/material';
import ChatRoomModal from './chatroom';
import { socket } from '../../../socket.jsx';

const CreateRoomDialog = ({ open, onClose }) => {
  const [roomType, setRoomType] = useState('public');
  const [isPublic, setIsPublic] = useState(true);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoomOpen, setChatRoomOpen] = useState(false);
  const userid = parseInt(localStorage.getItem("userId"));
  const [roomid, setRoomId] = useState(null);
  const [createdBy, setCreatedBy] = useState();
  
  const handleRoomTypeChange = (event) => {
    const selectedType = event.target.value;
    setRoomType(selectedType);
    setIsPublic(selectedType === 'public');
    console.log("Selected room type:", selectedType);
  };

  const handleCreateRoom = () => {
    setIsLoading(true);
    const data = {
      createdBy: userid,
      isPublic: isPublic,
      roomDescription: roomDescription, 
    };
    socket.emit("createRoom", data); 
  };

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (roomData) => {
      const { roomid, roomName, createdBy } = roomData;
      setRoomId(roomid);  // Store roomId
      setRoomName(roomName);
      setCreatedBy(createdBy);
      setIsLoading(false);
      setChatRoomOpen(true);
      setRoomDescription('');
      onClose();
    };

    const handleRoomError = (errorMessage) => {
      console.error("Room creation error:", errorMessage);
      alert(errorMessage);
      setIsLoading(false);
    };

    socket.on("roomCreated", handleRoomCreated);
    socket.on("roomError", handleRoomError);

    return () => {
      socket.off("roomCreated", handleRoomCreated);
      socket.off("roomError", handleRoomError);
    };
  }, [socket, onClose]);

  const handleCloseChatRoom = () => {
    setChatRoomOpen(false);
    onClose();
  };

  const defaultTheme = {
    palette: {
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      text: {
        primary: '#000000',
      },
      error: {
        main: '#d32f2f',
        dark: '#9a0007',
      },
      divider: '#e0e0e0',
    },
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create Room</DialogTitle>
        <DialogContent>
          <RadioGroup value={roomType} onChange={handleRoomTypeChange} row>
            <FormControlLabel value="public" control={<Radio />} label="Public Room" />
            <FormControlLabel value="private" control={<Radio />} label="Private Room" />
          </RadioGroup>

          <TextField
            fullWidth
            label="Room Description"
            value={roomDescription}
            onChange={(e) => setRoomDescription(e.target.value)} 
            sx={{ mt: 2 }}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateRoom} color="primary" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </DialogActions>
      </Dialog>

      <ChatRoomModal
        open={chatRoomOpen}
        onClose={handleCloseChatRoom}
        theme={defaultTheme}
        roomid={roomid}
        createdBy={createdBy}
      />
    </>
  );
};

export default CreateRoomDialog;
