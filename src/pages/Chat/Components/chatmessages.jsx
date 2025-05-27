import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import bgimage from "../../../assets/images/bgimage.jpg";
import bgimagedark from "../../../assets/images/bgimagedark.jpg";

const ChatMessages = ({ messages, selectedMember, messageContainerRef, theme }) => {
  const [loading, setLoading] = useState(true);

  const isImageFile = (filename) => {
    return /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(filename);
  };

  useEffect(() => {
    if (selectedMember && messages[selectedMember.userid] !== undefined) {
      setLoading(false);
    }
  }, [messages, selectedMember]);

  const hasMessages =
    selectedMember &&
    messages[selectedMember.userid] &&
    messages[selectedMember.userid].length > 0;

  return (
    <Paper
      sx={{
        flexGrow: 1,
        p: 2,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        backgroundImage:
          theme.palette.mode === "dark"
            ? `url(${bgimagedark})`
            : `url(${bgimage})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(64, 64, 64, 0.95)"
            : "rgba(255, 255, 255, 0.7)",
        backgroundBlendMode: "overlay",
        "&::-webkit-scrollbar": {
          width: "10px",
        },
        "&::-webkit-scrollbar-track": {
          background: theme.palette.mode === "dark" ? "#333" : "#f0f0f0",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: theme.palette.mode === "dark" ? "rgb(207, 207, 207)" : "rgb(125, 125, 125)",
          borderRadius: "10px",
          border: "2px solid transparent",
          backgroundClip: "content-box",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: theme.palette.mode === "dark" ? "#2a8c8d" : "#0056b3",
        },
      }}
    >
      <Box
        id="message-container"
        ref={messageContainerRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flexGrow: 1,
          justifyContent: !hasMessages ? "center" : "flex-start",
          alignItems: !hasMessages ? "center" : "stretch",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : hasMessages ? (
          messages[selectedMember.userid].map((msg, index) => {
            const currentDate = msg.timestamp?.substring(0, 10);
            const previousDate =
              index > 0
                ? messages[selectedMember.userid][index - 1].timestamp?.substring(0, 10)
                : null;

            return (
              <React.Fragment key={index}>
                {currentDate !== previousDate && (
                  <Box
                    sx={{
                      width: "fit-content",
                      mx: "auto",
                      mt: 4,
                      mb: 4,
                      px: 2,
                      py: 0.5,
                      backgroundColor: "#dee2e6",
                      borderRadius: 2,
                      textAlign: "center",
                      fontWeight: "bold",
                      boxShadow: 1,
                      color: "rgb(44, 42, 42)",
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
                    background:
                      msg.sender === "You"
                        ? "linear-gradient(135deg,rgb(144, 206, 241) 0%,rgb(85, 184, 245) 100%)"
                        : "linear-gradient(135deg,rgb(214, 211, 211) 0%, #f5f5f5 100%)",
                    color: "#000",
                    px: 1,
                    py: 0.7,
                    borderRadius: 2,
                    maxWidth: "70%",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    position: "relative",
                    fontSize: "0.7rem",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 12,
                      width: 0,
                      height: 0,
                      border: "8px solid transparent",
                      ...(msg.sender === "You"
                        ? {
                            right: -14,
                            borderLeftColor: "rgb(85, 184, 245)",
                          }
                        : {
                            left: -14,
                            borderRightColor: "rgb(214, 211, 211)",
                          }),
                    },
                  }}
                >
                  {msg.filedata && msg.filename ? (
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>📂</span> {msg.text}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {msg.text}
                    </Typography>
                  )}

                  {/* Image Preview */}
                  {msg.filedata && isImageFile(msg.filename) && (
                    <Box
                      sx={{
                        width: "100%",
                        maxHeight: "250px",
                        overflow: "hidden",
                        borderRadius: "8px",
                        mt: 1,
                      }}
                    >
                      <img
                        src={msg.filedata}
                        alt={msg.filename}
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  )}

                  {(msg.hasattachment || msg.filedata) && (
                    <Tooltip title={`🗂️ Download ${msg.text || "Attachment"}`}>
                      <IconButton
                        onClick={() => {
                          const link = document.createElement("a");

                          if (msg.hasattachment && msg.filedata) {
                            const fileBlob = new Blob([new Uint8Array(msg.filedata.data)]);
                            const fileType = fileBlob.type || "application/octet-stream";
                            const fileExtension = fileType.split("/")[1] || "bin";
                            const finalFileName = msg.filename || `download.${fileExtension}`;
                            link.href = msg.filedata;
                            link.download = finalFileName;
                          } else if (msg.filedata && msg.filename) {
                            const fileExtension = msg.filename.split(".").pop();
                            const finalFileName = msg.filename || `download.${fileExtension}`;
                            link.href = `data:${msg.filetype || "application/octet-stream"};base64,${msg.filedata}`;
                            link.download = finalFileName;
                          }

                          link.click();
                        }}
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        <DownloadIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      color: "rgba(0,0,0,0.6)",
                      textAlign: "right",
                      fontSize: "0.75rem",
                    }}
                  >
                    {msg.timestampRealTime
                      ? new Date(msg.timestampRealTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Typography>
                </Box>
              </React.Fragment>
            );
          })
        ) : (
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            No messages to display.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ChatMessages;
