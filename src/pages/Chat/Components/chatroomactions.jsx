import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import CreateRoomDialog from './createroomdialog.jsx';
import JoinRoomDialog from './joinroomdialog.jsx';
const ChatroomActions = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const handleOpenCreateDialog = () => setCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setCreateDialogOpen(false);

  const handleOpenJoinDialog = () => setJoinDialogOpen(true);
  const handleCloseJoinDialog = () => setJoinDialogOpen(false);

  const handleJoinRoom = () => {
    console.log('Joining room...');
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" marginLeft={2}>
      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleOpenCreateDialog}
          sx={{
            fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.7rem' },
            py: 0.4,
            px: 1,
            minWidth: 'auto',
            width: { xs: '30vw', sm: '3rem', md: '4.5rem', lg: '5.5rem' },
          }}
        >
          Create Room
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleOpenJoinDialog}
          sx={{
            fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.7rem' },
            py: 0.4,
            px: 1,
            minWidth: 'auto',
            width: { xs: '30vw', sm: '3rem', md: '4.5rem', lg: '5.5rem' },
          }}
        >
          Join Room
        </Button>
      </Box>

      <CreateRoomDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
      />

      <JoinRoomDialog open={joinDialogOpen} onClose={handleCloseJoinDialog} onJoinRoom={handleJoinRoom} />
    </Box>
  );
};

export default ChatroomActions;
