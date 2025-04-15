import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, Button, TextField, Stack, Avatar, CircularProgress } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxWidth: '90%',
  maxHeight: '80vh',
  overflowY: 'auto',
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
    profilePhoto: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      setLoading(true);
      axios
        .post('http://localhost:5000/api/user/profile/details', { userId })
        .then((response) => {
          setUserDetails({
            username: response.data.user.Username,
            email: response.data.user.Email,
            firstName: response.data.user.FirstName || '',
            lastName: response.data.user.LastName || '',
            phoneNumber: response.data.user.Mobile || '',
            profilePhoto: response.data.user.ProfilePhoto || '',
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePhoto(reader.result); 
      };
      reader.readAsDataURL(file); 
    }
  };

  const handleSaveChanges = () => {
      if (!userId) return;
    
      const cleanedProfilePhoto = newProfilePhoto
        ? newProfilePhoto.split(',')[1]
        : userDetails.profilePhoto.split(',')[1];
    
      const payload = {
        userId,
        username: userDetails.username,
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        profilePhoto: cleanedProfilePhoto,
      };
    
      setLoading(true);
      axios.post('http://localhost:5000/api/user/profile/update', payload).then(() => {
          setLoading(false);
          toast.success('Profile updated successfully!');
          axios.post('http://localhost:5000/api/user/profile/details', { userId }).then((response) => {
            setUserDetails({
              username: response.data.user.Username,
              email: response.data.user.Email,
              firstName: response.data.user.FirstName || '',
              lastName: response.data.user.LastName || '',
              phoneNumber: response.data.user.Mobile || '',
              profilePhoto: response.data.user.ProfilePhoto || '',
            });
          });
      })
      .catch((err) => {
        setError('Failed to update user profile');
        toast.error('Failed to update profile');
        setLoading(false);
      });
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
            <Avatar
              alt="Profile Photo"
              src={newProfilePhoto || userDetails.profilePhoto}
              sx={{
                width: 100,
                height: 100,
                marginBottom: 2,
                border: '2px solid #3f51b5',
              }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-photo"
              type="file"
              onChange={handlePhotoChange}
            />
            <label htmlFor="upload-photo">
              <Button variant="contained" component="span" color="primary" sx={{ marginTop: 2 }}>
                Change Profile Photo
              </Button>
            </label>

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
