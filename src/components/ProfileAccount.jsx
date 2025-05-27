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
    userid: '',
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    phonenumber: '',
    profilephoto: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);
  const [enlargedPhotoOpen, setEnlargedPhotoOpen] = useState(false);

  const userId = localStorage.getItem('userId');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (userId) {
      setLoading(true);
      axios
        .post(`${apiUrl}/api/user/profile/details`, { userid: userId })
        .then((response) => {
          setUserDetails({
            userid: response.data.user.userid,
            username: response.data.user.username,
            email: response.data.user.email,
            firstname: response.data.user.firstname || '',
            lastname: response.data.user.lastname || '',
            phonenumber: response.data.user.mobile || '',
            profilephoto: response.data.user.profilephoto || '',
          });
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to fetch user details', err);
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
      : userDetails.profilephoto?.split(',')[1];

    const payload = {
      userid: userDetails.userid,
      username: userDetails.username,
      email: userDetails.email,
      firstname: userDetails.firstname,
      lastname: userDetails.lastname,
      profilephoto: cleanedProfilePhoto,
      phonenumber: userDetails.phonenumber,
    };

    setLoading(true);
    axios.post(`${apiUrl}/api/user/profile/update`, payload).then(() => {
      setLoading(false);
      toast.success('Profile updated successfully!');
      axios.post(`${apiUrl}/api/user/profile/details`, { userId }).then((response) => {
        setUserDetails({
          userid: response.data.user.userid,
          username: response.data.user.username,
          email: response.data.user.email,
          firstname: response.data.user.firstname || '',
          lastname: response.data.user.lastname || '',
          phonenumber: response.data.user.mobile || '',
          profilephoto: response.data.user.profilephoto || '',
        });
      });
    })
    .catch((err) => {
      setError('Failed to update user profile');
      toast.error('Failed to update profile');
      setLoading(false);
    });
  };

  // Handle opening/closing of enlarged profile photo modal
  const handleAvatarClick = () => {
    setEnlargedPhotoOpen(true);
  };

  const handleCloseEnlargedPhoto = () => {
    setEnlargedPhotoOpen(false);
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
              src={newProfilePhoto || userDetails.profilephoto}
              sx={{
                width: 100,
                height: 100,
                marginBottom: 2,
                border: '2px solid #3f51b5',
                cursor: 'pointer',
              }}
              onClick={handleAvatarClick} 
            />

            <Modal open={enlargedPhotoOpen} onClose={handleCloseEnlargedPhoto}>
              <Box sx={{ ...modalStyle, width: 400, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Looking Great!
                </Typography>
                <Avatar
                  alt="Enlarged Profile Photo"
                  src={newProfilePhoto || userDetails.profilephoto}
                  sx={{ width: 300, height: 300, marginBottom: 2 }}
                />
                <Button variant="contained" color="primary" onClick={handleCloseEnlargedPhoto}>
                  Close
                </Button>
              </Box>
            </Modal>

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
              value={userDetails.firstname}
              onChange={handleInputChange}
              name="firstname"
            />
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              value={userDetails.lastname}
              onChange={handleInputChange}
              name="lastname"
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={userDetails.phonenumber}
              onChange={handleInputChange}
              name="phonenumber"
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
