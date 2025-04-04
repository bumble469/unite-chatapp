import React, { useState } from 'react';
import { IconButton, Box, Tooltip, Menu, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useLocation } from 'react-router-dom'; // Import useLocation to track the current route

const Header = ({ mode, setMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation(); // Get the current route

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light')); // Toggle theme mode
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  // Only show the settings icon on the "/chat" page
  const isChatPage = location.pathname === "/chat";

  return (
    <Box
      sx={{
        position: 'fixed', // Keep the header fixed at the top
        top: 0,
        right: 0,
        display: 'flex',
        gap: 1,
        zIndex: 1000, // Ensure it's on top of other elements
        padding: 1, // Adjust padding to keep icons spaced properly
      }}
    >
      <Tooltip title="Toggle theme">
        <IconButton onClick={toggleTheme} color="inherit">
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Tooltip>

      {isChatPage && (
        <Tooltip title="Settings">
          <IconButton color="inherit" onClick={handleSettingsClick}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleSettingsClose}>Profile</MenuItem>
        <MenuItem onClick={handleSettingsClose}>Account</MenuItem>
        <MenuItem onClick={handleSettingsClose}>Logout</MenuItem>
      </Menu>
    </Box>
  );
};

export default Header;
