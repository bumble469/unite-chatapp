import React, { useRef } from "react";
import { Box, TextField, InputAdornment, IconButton, Button } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

const ChatInput = ({ message, setMessage, handleSendMessage, handleFileUpload }) => {
  const fileInputRef = useRef(null);

  return (
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
  );
};

export default ChatInput;
