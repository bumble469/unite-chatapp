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
  Dialog, DialogActions, DialogContent, DialogTitle,
} from "@mui/material";
import { Add, Cancel } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import unitelogonobg from '../../../assets/images/unite-logo-nobg.png';
import ChatroomActions from "./chatroomactions.jsx";
import { socket } from '../../../socket.jsx'; 

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
  const apiUrl = import.meta.env.VITE_API_URL;
  const [openPhotoModal, setOpenPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState("");

  useEffect(() => {
    const handleChatCreated = (data) => {
      console.log("Chat created:", data.chatId);
      setChatId(data.chatId);
    };
    socket.on("chatCreated", handleChatCreated);
  
    return () => {
      socket.off("chatCreated", handleChatCreated);
    };
  }, [userId]);
  

  useEffect(() => {
    if (members && members.length > 0) {
      socket.on("updateUnreadCounts", (data) => {
        const unreadCounts = data;
        for (const [senderId, unreadCount] of Object.entries(unreadCounts)) {
          setUnreadCounts((prev) => ({
            ...prev,
            [senderId]: unreadCount,
          }));
        }
      });

      return () => {
        socket.off("updateUnreadCounts");
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
      const response = await axios.post(`${apiUrl}/api/chat/search-user`, {
        username
      });
      const users = response.data.users;
      console.log("users: ", users)
      if (users.length > 0) {
        const mappedUsers = users.map((u) => ({
          id: u.userid,
          name: u.username,
          avatar: u.profilephoto,
        }));
        setSearchResults(mappedUsers);
      } else {
        setSearchResults([]);
      }
      setLoading(false)
    } catch (err) {
      console.error("Search Error:", err.message);
      setSearchResults([]);
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

      const response = await axios.post(`${apiUrl}/api/chat/send-request`, {
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
    if (socket) {
      const receiverId = member.userid;
      socket.emit("startChat", {
        senderId: userId,
        receiverId: receiverId,
      });
    }
  };

  const handleOpenPhotoModal = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setOpenPhotoModal(true);
  };

  const handleClosePhotoModal = () => {
    setOpenPhotoModal(false);
    setSelectedPhoto("");
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
      <Box sx={{display:'flex'}}>
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
        <ChatroomActions/>
      </Box>
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
        {members.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 4 }}
            >
              No friends added yet!
            </Typography>        
          ) : (
          <List>
            {Array.isArray(members) &&
              members
                .filter((member) => (member.username || "").toLowerCase().includes(search.toLowerCase()))
                .map((member, index) => (
                  <ListItem
                    key={index}
                    selected={selectedMember?.userid === member.userid}
                    onClick={() => handleSelectMember(member)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: theme.palette.mode === "dark" ? "rgb(46, 46, 46)" : "rgb(235, 235, 235)",
                      color: theme.palette.text.primary,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      transition: "background-color 0.3s",
                    }}
                  >
                    <Avatar 
                        src={member.profilephoto} 
                        sx={{ mr: 2 }} 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleOpenPhotoModal(member.profilephoto);
                        }} 
                      />
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
                          {member.firstname} {member.lastname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.username}
                        </Typography>
                      </Box>
  
                      {unreadCounts[member.userid] > 0 && (
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
                          {unreadCounts[member.userid] > 4 ? "4+" : unreadCounts[member.userid]}
                        </Box>
                      )}
  
                    </Box>
                  </ListItem>
                ))}
          </List>
        )}
      </Box>
  
      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)}>
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: "100%" }}>
          {toastMsg}
        </Alert>
      </Snackbar>
  
      <Dialog open={openPhotoModal} onClose={handleClosePhotoModal} maxWidth="sm" fullWidth>
        <DialogTitle>Not better than you though!</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {selectedPhoto ? (
            <Avatar src={selectedPhoto} sx={{ width: 200, height: 200 }} />
          ) : (
            <CircularProgress size={50} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhotoModal} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
