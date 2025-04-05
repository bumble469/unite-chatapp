import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, Button, TextField, Stack, Avatar, CircularProgress } from '@mui/material';
import axios from 'axios'; // Ensure you have axios installed for API requests

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500, // Set width to be a bit wider
  maxWidth: '90%',
  maxHeight: '80vh', // Ensure modal stays within page height
  overflowY: 'auto', // Scrollable if content overflows
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ProfileAccount = ({ open, onClose }) => {
  const [userDetails, setUserDetails] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    profilePhoto: '', // To store the base64 image
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      setLoading(true);
      axios
        .post('http://localhost:5000/api/user/profile/details', { userId }) // API POST request to get user details
        .then((response) => {
          setUserDetails({
            username: response.data.user.Username,
            email: response.data.user.Email,
            firstName: response.data.user.FirstName || '', // Assuming FirstName might be null
            lastName: response.data.user.LastName || '', // Assuming LastName might be null
            phoneNumber: response.data.user.Mobile || '', // Assuming PhoneNumber might be null
            profilePhoto: response.data.user.ProfilePhoto || '', // Assuming ProfilePhoto might be null
          });
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to fetch user details');
          setLoading(false);
        });
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    // Add logic to save changes to the API (PATCH or PUT request)
    console.log('Saving changes:', userDetails);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Profile & Account
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ marginTop: 2 }}>
            {error}
          </Typography>
        ) : (
          <Stack spacing={2} alignItems="center">
            {/* Profile Photo - Circle */}
            <Avatar
              alt="Profile Photo"
              src={userDetails.profilePhoto}
              sx={{
                width: 100,
                height: 100,
                marginBottom: 2,
                border: '2px solid #3f51b5', // Optional: add border for better visibility
              }}
            />

            {/* User Details */}
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={userDetails.username}
              onChange={handleInputChange}
              name="username"
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={userDetails.email}
              onChange={handleInputChange}
              name="email"
            />
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              value={userDetails.firstName}
              onChange={handleInputChange}
              name="firstName"
            />
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              value={userDetails.lastName}
              onChange={handleInputChange}
              name="lastName"
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={userDetails.phoneNumber}
              onChange={handleInputChange}
              name="phoneNumber"
            />

            <Button variant="contained" color="primary" onClick={handleSaveChanges} sx={{ marginTop: 2 }}>
              Save Changes
            </Button>
          </Stack>
        )}
      </Box>
    </Modal>
  );
};

export default ProfileAccount;
