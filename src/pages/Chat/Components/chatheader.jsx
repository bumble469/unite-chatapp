import React from "react";
import { Box, Avatar, Typography } from "@mui/material";

const ChatHeader = ({ selectedMember, theme }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          transform: {
            xs: "scale(0.8)",
            sm: "scale(0.9)",
            md: "scale(1)",
          },
          transformOrigin: "left center",
        }}
      >
        <Avatar src={selectedMember.profilephoto} sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ maxWidth: { xs: "fit-content", sm: "200px" } }}>
          {selectedMember.firstname} {selectedMember.lastname}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatHeader;
