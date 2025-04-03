import { useTheme } from "@mui/material/styles"; // Import useTheme
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
} from "@mui/material";
import { useState } from "react";

const Chat = () => {
  const theme = useTheme(); // Access current theme
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});

  const members = [
    { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
    { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
    { name: "Charlie", avatar: "https://i.pravatar.cc/40?img=3" },
    { name: "David", avatar: "https://i.pravatar.cc/40?img=4" },
  ];

  // Handle selecting a member
  const handleSelectMember = (member) => {
    setSelectedMember(member);
    if (!messages[member.name]) {
      setMessages((prev) => ({ ...prev, [member.name]: [] }));
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (selectedMember && message.trim()) {
      setMessages((prev) => ({
        ...prev,
        [selectedMember.name]: [
          ...prev[selectedMember.name],
          { text: message, sender: "You" },
        ],
      }));
      setMessage("");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: "100vh", display: "flex", p: 2 }}>
      <Grid container sx={{ height: "100%", borderRadius: 2, overflow: "hidden" }}>
        {/* Sidebar with Member List */}
        <Grid
          item
          sm={4}
          md={3}
          sx={{
            backgroundColor: theme.palette.background.paper, // Dynamic Theme Background
            p: 2,
            borderRight: `1px solid ${theme.palette.divider}`, // Dynamic Border
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Members
          </Typography>
          <List>
            {members.map((member, index) => (
              <ListItem
                key={index}
                button
                selected={selectedMember?.name === member.name}
                onClick={() => handleSelectMember(member)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor:
                    selectedMember?.name === member.name
                      ? theme.palette.action.selected
                      : "transparent", // Highlight selection
                  color: theme.palette.text.primary, // Dynamic text color
                }}
              >
                <Avatar src={member.avatar} sx={{ mr: 2 }} />
                <ListItemText primary={member.name} />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Chat Box */}
        <Grid
          item
          sm={8}
          md={9}
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
            height: "100%",
            backgroundColor: theme.palette.background.default, // Apply theme to chat background
          }}
        >
          {selectedMember ? (
            <>
              {/* Chat Header */}
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <Avatar src={selectedMember.avatar} sx={{ mr: 2 }} />
                Chat with {selectedMember.name}
              </Typography>

              {/* Chat Messages */}
              <Paper
                sx={{
                  flexGrow: 1,
                  p: 2,
                  overflowY: "auto",
                  backgroundColor: theme.palette.background.paper, // Dynamic Theme
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  height: "70vh",
                }}
              >
                {messages[selectedMember.name]?.length > 0 ? (
                  messages[selectedMember.name].map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: msg.sender === "You" ? "flex-end" : "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          display: "inline-block",
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: msg.sender === "You"
                            ? theme.palette.primary.main
                            : theme.palette.background.default,
                          color: msg.sender === "You" ? "#fff" : theme.palette.text.primary,
                          maxWidth: "70%",
                        }}
                      >
                        {msg.text}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ textAlign: "center" }}>
                    No messages yet.
                  </Typography>
                )}
              </Paper>

              {/* Chat Input */}
              <Box sx={{ display: "flex", mt: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ ml: 1, px: 3 }}
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center", mt: "40vh" }}>
              Select a member to start chatting
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
