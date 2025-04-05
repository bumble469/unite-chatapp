import { useState, useEffect } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Box,
  TextField,
  Button,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add, Cancel } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

const Sidebar = ({ members, setMembers, selectedMember, onSelect }) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [showAddField, setShowAddField] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (username.trim().length > 1) {
        handleSearchUser(username);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleSearchUser = async (username) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/chat/search-user", { username });
      const users = response.data.users;

      if (users.length > 0) {
        const mappedUsers = users.map((u) => ({
          id: u.UserID,
          name: u.Username,
          avatar: u.ProfilePhoto, // Ensure that the avatar is a valid base64 string or URL
        }));
        setSearchResults(mappedUsers);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search Error:", err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user) => {
    const exists = members.some((m) => m.id === user.id);
    if (exists) {
      setToastMsg("User already added");
      setToastOpen(true);
      return;
    }

    try {
      const senderId = parseInt(localStorage.getItem("userId"), 10);
      const receiverId = user.id;

      const response = await axios.post("http://localhost:5000/api/chat/send-request", {
        senderId,
        receiverId,
      });

      setMembers((prevMembers) => [...prevMembers, user]);

      setToastMsg(response.data.message || `Request sent to ${user.name}`);
      setToastOpen(true);

      // Reset search
      setUsername("");
      setSearchResults([]);
      setShowAddField(false);
    } catch (err) {
      console.error("Error sending request:", err.message);
      setToastMsg(err.response?.data?.message || "Failed to send request");
      setToastOpen(true);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        p: 2,
        borderRight: `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
        Chats
      </Typography>

      {/* Connect Button & Add User Section */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        {!showAddField ? (
          <Button variant="contained" size="small" onClick={() => setShowAddField(true)}>
            Connect
          </Button>
        ) : (
          <>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {loading ? (
              <CircularProgress size={20} sx={{ mt: 1, ml: 1 }} />
            ) : (
              searchResults.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleAddUser(user)}>
                      <Add />
                    </IconButton>
                  }
                >
                  <Avatar src={user.avatar} sx={{ mr: 1 }} />
                  <ListItemText primary={user.name} />
                </ListItem>
              ))
            )}
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              startIcon={<Cancel />}
              onClick={() => {
                setShowAddField(false);
                setUsername("");
                setSearchResults([]);
              }}
            >
              Cancel
            </Button>
          </>
        )}
      </Stack>

      {/* Search bar for filtering friends */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Members List */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List>
          {Array.isArray(members) &&
            members
              .filter((member) => (member.Username || "").toLowerCase().includes(search.toLowerCase()))
              .map((member, index) => (
                <ListItem
                  key={index}
                  button
                  selected={selectedMember?.id === member.id}
                  onClick={() => onSelect(member)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor:
                      selectedMember?.id === member.id
                        ? theme.palette.action.selected
                        : "transparent",
                    color: theme.palette.text.primary,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: "background-color 0.3s",
                  }}
                >
                  <Avatar src={member.ProfilePhoto} sx={{ mr: 2 }} />
                  <ListItemText
                    primary={`${member.FirstName} ${member.LastName}`}  // Primary: FirstName and LastName
                    secondary={member.Username}  // Secondary: Username
                  />
                </ListItem>
              ))}
        </List>
      </Box>

      {/* Toast Snackbar */}
      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)}>
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: "100%" }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Sidebar;
