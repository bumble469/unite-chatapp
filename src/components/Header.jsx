import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Badge,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import RequestModal from '../components/FriendRequests';
import ProfileModal from '../components/ProfileAccount';
import axios from 'axios';

const Header = ({ mode, setMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [requests, setRequests] = useState([]);
  const location = useLocation();
  const userId = parseInt(localStorage.getItem('userId'));
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/chat/requests/pending/${userId}`);
        setRequests(res.data.pendingRequests);
      } catch (err) {
        console.error('Error fetching requests:', err.message);
        setRequests([]);
      }
    };

    if (userId) fetchRequests();
  }, [userId]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClick = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const isChatPage = location.pathname === '/chat';

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
    setAnchorEl(null);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('userId');
    setOpenLogoutDialog(false);
    window.location.href = '/auth';
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  const handleProfileClick = () => {
    setOpenProfileModal(true);
    setAnchorEl(null);
  };

  const iconScale = {
    transform: {
      xs: 'scale(0.87)',
      sm: 'scale(0.9)',
      md: 'scale(1)',
      lg: 'scale(1.05)',
      xl: 'scale(1.1)',
    },
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          display: 'flex',
          gap: 1,
          zIndex: 1000,
          padding: 1,
        }}
      >
        <Tooltip title="Toggle theme">
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'light' ? (
              <Brightness4Icon sx={iconScale} />
            ) : (
              <Brightness7Icon sx={iconScale} />
            )}
          </IconButton>
        </Tooltip>

        {isChatPage && (
          <>
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationsClick}>
                <Badge
                  color="error"
                  variant="dot"
                  overlap="circular"
                  invisible={requests.length === 0}
                >
                  <NotificationsIcon sx={iconScale} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton color="inherit" onClick={handleSettingsClick}>
                <SettingsIcon sx={iconScale} />
              </IconButton>
            </Tooltip>
          </>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleSettingsClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleProfileClick}>
            <AccountCircleIcon sx={{ ...iconScale, marginRight: 1 }} />
            Profile & Account
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <ExitToAppIcon sx={{ ...iconScale, marginRight: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to logout?</DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <RequestModal open={openModal} onClose={handleModalClose} />
      <ProfileModal open={openProfileModal} onClose={() => setOpenProfileModal(false)} />
    </>
  );
};

export default Header;
