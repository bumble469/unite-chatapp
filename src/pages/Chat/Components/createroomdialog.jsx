import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, Radio, RadioGroup, FormControlLabel, TextField
} from '@mui/material';
import ChatRoomModal from './chatroom';

const CreateRoomDialog = ({ open, onClose, socket }) => {
  const [roomType, setRoomType] = useState('public');
  const [isPublic, setIsPublic] = useState(true);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');  // State for room description
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoomOpen, setChatRoomOpen] = useState(false);
  const userid = parseInt(localStorage.getItem("userId"));
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
    console.log("Room description: ", roomDescription);
  };

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (roomData) => {
      const { roomName, createdBy } = roomData;  // Destructure the received room data
      setRoomName(roomName);  
      setCreatedBy(createdBy);
      setIsLoading(false);
      setChatRoomOpen(true);  
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
  }, [socket]);

  const handleCloseChatRoom = () => {
    setChatRoomOpen(false);
    onClose();
  };

  const dummyMembers = ['Alice', 'Bob', 'Charlie'];

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
        members={dummyMembers}
        theme={defaultTheme}
        roomName={roomName}
        roomDescription={roomDescription}
        socket = {socket}
        createdBy={createdBy}
      />
    </>
  );
};

export default CreateRoomDialog;
