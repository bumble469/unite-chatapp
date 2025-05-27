import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Stack,
} from '@mui/material';
import axios from 'axios';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '90vw', // Small screens (mobile)
    sm: 400,    // Tablets and small laptops
    md: 450,    // Medium and up
  },
  maxHeight: '80vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: {
    xs: 2,
    sm: 3,
  },
};

const FriendRequests = ({ open, onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/chat/requests/pending/${userId}`);

        setRequests(res.data.pendingRequests || []);
      } catch (err) {
        console.error('Error fetching requests:', err.message);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId && open) fetchRequests();
  }, [userId, open]);

  const handleAction = async (requestId, status) => {
    try {
      await axios.put(`${apiUrl}/api/chat/requests/update/${requestId}`, { status });
      setRequests((prev) => prev.filter((r) => r.requestid !== requestId));
    } catch (err) {
      console.error(`Error updating request ${requestId}:`, err.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2}>Pending Friend Requests</Typography>

        {loading ? (
          <CircularProgress />
        ) : requests.length === 0 ? (
          <Typography>No pending requests 🎉</Typography>
        ) : (
          <List>
            {requests.map((req) => (
              <ListItem key={req.requestid} divider>
                <ListItemText
                  primary={req.username || 'Unknown'}
                  secondary={`ID: ${req.senderid}`}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => {
                      handleAction(req.requestid, 'accepted')
                      window.location.reload()
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="default"
                    onClick={() => handleAction(req.requestid, 'ignored')}
                  >
                    Ignore
                  </Button>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Modal>
  );
};

export default FriendRequests;
