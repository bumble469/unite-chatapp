import React, { useState, useRef } from "react";
import { Box, TextField, InputAdornment, IconButton, Button } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions"; // Emoji selection icon
import EmojiPicker from "emoji-picker-react"; // Import emoji picker

const ChatInput = ({ handleSendMessage, handleFileUpload }) => {
  const [message, setMessage] = useState(""); // Ensure message is always a string
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to toggle emoji picker visibility

  // Handler for when an emoji is selected
  const onEmojiClick = (event) => {
    setMessage((prevMessage) => prevMessage + event.emoji); // Append emoji to the message
  };

  const handleSend = () => {
    handleSendMessage(message);
    setMessage(""); // Clear the input box after sending the message
  };

  return (
    <Box sx={{ display: "flex", mt: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={message} // Controlled value, message is always a string
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

              {/* Emoji button */}
              <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <EmojiEmotionsIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ ml: 1, px: 3 }}
        onClick={handleSend} // Use handleSend to clear the input box after sending
        endIcon={<SendIcon />}
      >
        Send
      </Button>

      {showEmojiPicker && (
        <Box sx={{ position: "absolute", bottom: "60px", right: "10px", zIndex: 100 }}>
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </Box>
      )}
    </Box>
  );
};

export default ChatInput;
