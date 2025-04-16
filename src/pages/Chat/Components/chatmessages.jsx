import React from "react";
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

const ChatMessages = ({
  messages,
  selectedMember,
  messageContainerRef,
  theme,
}) => {
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
            ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bgimagedark})`
            : `url(${bgimage})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(39, 38, 38, 0.92)"
            : "rgba(255, 255, 255, 0.94)",
        backgroundBlendMode: "overlay",
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
          justifyContent:
            !messages[selectedMember.userid] ||
            messages[selectedMember.userid].length === 0
              ? "center"
              : "flex-start",
          alignItems:
            !messages[selectedMember.userid] ||
            messages[selectedMember.userid].length === 0
              ? "center"
              : "stretch",
        }}
      >
        {messages[selectedMember.userid]?.length > 0 ? (
          messages[selectedMember.userid].map((msg, index) => {
            const currentDate = msg.timestamp?.substring(0, 10);
            const previousDate =
              index > 0
                ? messages[selectedMember.userid][index - 1].timestamp?.substring(
                    0,
                    10
                  )
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
                      color:"rgb(44, 42, 42)"
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
                        ? "linear-gradient(135deg,rgb(104, 183, 229) 0%,rgb(45, 140, 199) 100%)"
                        : "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
                    color: "#000",
                    px: 2,
                    py: 1.5,
                    borderRadius: 4,
                    maxWidth: "70%",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    position: "relative",
                    fontSize: "0.95rem",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 12,
                      width: 0,
                      height: 0,
                      border: "8px solid transparent",
                      ...(msg.sender === "You"
                        ? {
                            right: -16,
                            borderLeftColor: "#4DA0B0",
                          }
                        : {
                            left: -16,
                            borderRightColor: "#e0e0e0",
                          }),
                    },
                  }}
                >
                  {msg.fileData && msg.fileName ? (
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

                  {(msg.isFile || msg.fileData) && (
                    <Tooltip
                      title={`🗂️ Download ${msg.text || "Attachment"}`}
                    >
                      <IconButton
                        onClick={() => {
                          const link = document.createElement("a");

                          if (msg.isFile && msg.fileData) {
                            const fileBlob = new Blob([
                              new Uint8Array(
                                msg.fileData?.data || msg.fileData
                              ),
                            ]);
                            const fileType =
                              fileBlob.type || "application/octet-stream";
                            const fileExtension =
                              fileType.split("/")[1] || "bin";
                            const finalFileName =
                              msg.text || `download.${fileExtension}`;
                            link.href = msg.fileData;
                            link.download = finalFileName;
                          } else if (msg.fileData && msg.fileName) {
                            const fileExtension = msg.fileName.split(".").pop();
                            const finalFileName =
                              msg.fileName || `download.${fileExtension}`;
                            link.href = `data:${
                              msg.fileType || "application/octet-stream"
                            };base64,${msg.fileData}`;
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
                    {msg.timestamp ? msg.timestamp.substring(11, 19) : ""}
                  </Typography>
                </Box>
              </React.Fragment>
            );
          })
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Paper>
  );
};

export default ChatMessages;
