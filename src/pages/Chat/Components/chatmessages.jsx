import React from "react";
import { Box, Paper, Typography } from "@mui/material";

const ChatMessages = ({ messages, selectedMember, messageContainerRef, theme }) => {
  return (
    <Paper
      sx={{
        flexGrow: 1,
        p: 2,
        overflowY: "auto",
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        id="message-container"
        ref={messageContainerRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {messages[selectedMember.id]?.length > 0 &&
          messages[selectedMember.id].map((msg, index) => {
            const currentDate = msg.timestamp?.substring(0, 10);
            const previousDate =
              index > 0
                ? messages[selectedMember.id][index - 1].timestamp?.substring(0, 10)
                : null;

            return (
              <React.Fragment key={index}>
                {currentDate !== previousDate && (
                  <Box
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      mb: 2,
                      mt: 2,
                      borderTop: "1px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      py: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      {currentDate}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                    backgroundColor: msg.sender === "You" ? "#82C8E5" : "#D3D3D3",
                    color: "#000",
                    px: 1,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "70%",
                    boxShadow: 2,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 8,
                      width: 0,
                      height: 0,
                      border: "6px solid transparent",
                      ...(msg.sender === "You"
                        ? {
                            right: -12,
                            borderLeftColor: "#82C8E5",
                          }
                        : {
                            left: -12,
                            borderRightColor: "#D3D3D3",
                          }),
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {msg.text}
                  </Typography>
                  <Typography variant="caption">
                    {msg.timestamp ? msg.timestamp.substring(11, 19) : ""}
                  </Typography>
                </Box>
              </React.Fragment>
            );
          })}
      </Box>
    </Paper>
  );
};

export default ChatMessages;
