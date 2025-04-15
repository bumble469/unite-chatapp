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
  CircularProgress
} from "@mui/material";
import { Add, Cancel } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import io from "socket.io-client";
import unitelogonobg from '../../../assets/images/unite-logo-nobg.png'
let socketRef = null;

const Sidebar = ({
  members,
  setMembers,
  selectedMember,
  onSelect,
  setChatId,
}) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [showAddField, setShowAddField] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = parseInt(localStorage.getItem("userId"), 10);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!socketRef) {
      socketRef = io("http://localhost:5000");

      socketRef.on("connect", () => {
        console.log("Socket connected:", socketRef.id);
        socketRef.emit("join", userId);
      });

      socketRef.on("newMessage", (data) => {
        if (data.receiverId === userId) {
          setUnreadCounts((prev) => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1,
          }));
        }
      });

      socketRef.on("chatCreated", (data) => {
        const { chatId } = data;
        console.log("Chat ID received:", chatId);
        setChatId(chatId);
      });
    }

    return () => {
      if (socketRef) {
        socketRef.disconnect();
        socketRef = null;
      }
    };
  }, []);

  useEffect(() => {
    if (members && members.length > 0) {
      const friendIds = members.map(member => member.UserID);
      socketRef.emit("getUnreadCounts", { 
        userId, 
        friendIds
      });

      socketRef.on("unreadCounts", (data) => {
        const unreadCounts = data;
        for (const [senderId, unreadCount] of Object.entries(unreadCounts)) {
          setUnreadCounts((prev) => ({
            ...prev,
            [senderId]: unreadCount,
          }));
        }
      });

      return () => {
        socketRef.off("unreadCounts");
      };
    }
  }, [members]);

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
      const response = await axios.post("http://localhost:5000/api/chat/search-user", {
        username
      });
      const users = response.data.users;

      if (users.length > 0) {
        const mappedUsers = users.map((u) => ({
          id: u.UserID,
          name: u.Username,
          avatar: u.ProfilePhoto,
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

      setUsername("");
      setSearchResults([]);
      setShowAddField(false);
    } catch (err) {
      console.error("Error sending request:", err.message);
      setToastMsg(err.response?.data?.message || "Failed to send request");
      setToastOpen(true);
    }
  };

  const handleSelectMember = (member) => {
    onSelect(member);   
    const userId = parseInt(localStorage.getItem("userId"), 10);

    if (socketRef) {
      const receiverId = member.UserID;
      socketRef.emit("startChat", {
        senderId: userId,
        receiverId: receiverId,
      });
    }
  };

  return (
    <Box
      sx={{
        height: {
          xs: "100vh",
          sm: "auto",
        },
        width: {
          xs: "100vw",
          sm: "400px",
        },
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        borderRadius: {
          xs: 0,
          sm: 3,
        },
        boxShadow: {
          xs: "none",
          sm: "0px 4px 20px rgba(0, 0, 0, 0.2)",
        },
        position: {
          xs: "absolute",
          sm: "relative",
        },
        zIndex: {
          xs: 1200,
          sm: "auto",
        },
        mt: {
          xs: 0,
          sm: "1.2rem",
        },
        mb: {
          xs: 0,
          sm: "1.5rem",
        },
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          color: theme.palette.text.primary, 
          display: 'flex', 
          alignItems: 'center',
        }}
      >
        <img 
          src={unitelogonobg} 
          alt="U" 
          height={30} 
          style={{ marginRight:-20,marginTop: 4, height:'4rem'}}
        />
        nite
      </Typography>

      <Stack spacing={1} sx={{ mb: 2,px:2 }}>
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

      <TextField
        variant="outlined"
        size="small"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, px:2 }}
      />

      <Box sx={{ flexGrow: 1, overflowY: "auto", px:2 }}>
        <List>
          {Array.isArray(members) &&
            members
              .filter((member) => (member.Username || "").toLowerCase().includes(search.toLowerCase()))
              .map((member, index) => (
                <ListItem
                  key={index}
                  button
                  selected={selectedMember?.id === member.id}
                  onClick={() => handleSelectMember(member)}
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {member.FirstName} {member.LastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.Username}
                      </Typography>
                    </Box>

                    {unreadCounts[member.UserID] > 0 && (
                      <Box
                        sx={{
                          backgroundColor: "#CD5C5C",
                          color: "white",
                          borderRadius: "12px",
                          px: 1,
                          minWidth: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 400,
                          boxShadow: 1,
                          animation: "bounce 0.4s ease",
                          '@keyframes bounce': {
                            '0%': { transform: 'scale(0.8)' },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)' },
                          },
                        }}
                      >
                        {unreadCounts[member.UserID] > 4 ? "4+" : unreadCounts[member.UserID]}
                      </Box>
                    )}

                  </Box>

                </ListItem>
              ))}
        </List>
      </Box>

      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)}>
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: "100%" }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export const getSocket = () => socketRef;

export default Sidebar;
