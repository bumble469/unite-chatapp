import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Grid,
  Button,
  Typography,
  Container,
  useMediaQuery,
} from "@mui/material";
import ArrowUpIcon from '@mui/icons-material/ArrowUpward';
import Sidebar from "./Components/sidebar";
import { socket } from '../../socket.jsx';
import axios from "axios";
import ChatMessages from "./Components/chatmessages";
import ChatHeader from './Components/chatheader';
import ChatInput from './Components/chatinput';
import talkinggif from "../../assets/images/talkgif.gif";
import { toast } from 'react-toastify';
const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [chatId, setChatId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [members, setMembers] = useState([]);
  const userId = parseInt(localStorage.getItem("userId"), 10);
  const messageContainerRef = useRef(null); 
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.post(`${apiUrl}/api/chat/friends`, {
          userid: userId
        });
        const data = res.data;
        const uniqueFriends = [...new Set(data.friends)];
        console.log("Unique friends:", uniqueFriends);
        setMembers(uniqueFriends);        
      } catch (err) {
        console.error("Failed to load friends:", err);
      }
    };

    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  useEffect(() => {
    if (!selectedMember || !chatId) return; 

    const fetchChatHistory = async () => {
      try {
        const res = await axios.post(`${apiUrl}/api/chat/chat-history`, {
          chatId: chatId,
          userId: userId,
        });
      
        const data = res.data;
      
        const messagesData = data.messages.map((msg) => {
          const hasAttachment = !!msg.filedata;
          const fileData = hasAttachment ? msg.filedata : null;
          const fileType = hasAttachment ? msg.filetype : null;
          const fileName = hasAttachment ? msg.filename : null;
      
          return {
            text: msg.messagetext,
            sender: msg.senderid === userId ? "You" : "Other",
            timestamp: msg.sentat,
            hasattachment: hasAttachment,
            filedata: fileData,
            filetype: fileType,
            filename: fileName,
          };
        });
      
        setMessages((prev) => ({
          ...prev,
          [selectedMember?.userid]: messagesData,
        }));
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }      
    };

    fetchChatHistory();
  }, [chatId, userId]);  

  const handleSelectMember = (member) => {
    setSelectedMember(member);  
    if (!messages[member?.userid]) {
      setMessages((prev) => ({
        ...prev,
        [member?.userid]: [],
      }));
    }
  };

  useEffect(() => {
    if (!socket || !selectedMember) return;
    socket.emit('markMessagesAsRead', {
      senderId: selectedMember?.userid, 
      receiverId: userId,  
    });
  }, [messages, socket, selectedMember]);
  
  const handleSendMessage = (text, isFile = false, file = null) => {
    if (selectedMember && text.trim() && socket) {
      const localTimestamp = new Date().toISOString();
      const newMessage = {
        text,
        senderId: userId,
        receiverId: selectedMember?.userid,
        isFile,
        timestamp: localTimestamp,
        chatId: chatId,
      };

      if (isFile && file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const fileData = reader.result;

          newMessage.fileData = fileData;

          socket.emit("sendMessage", newMessage);

          setMessages((prev) => ({
            ...prev,
            [selectedMember?.userid]: [
              ...prev[selectedMember?.userid],
              { text: `${file.name}`, sender: "You", isFile, filedata: fileData, timestamp: localTimestamp },
            ],
          }));
          setMessage("");
        };

        reader.readAsArrayBuffer(file);
      } else {
        socket.emit("sendMessage", newMessage);

        setMessages((prev) => ({
          ...prev,
          [selectedMember?.userid]: [
            ...prev[selectedMember?.userid],
            { text, sender: "You", isFile, timestamp:localTimestamp },
          ],
        }));
        setMessage("");
      }
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => {
      const {
        senderId,
        text,
        isFile,
        fileData,
        timestamp: timestampRealTime,
      } = msg;
  
      setMessages((prevMessages) => {  
        const newMessage = isFile
          ? {
              text,
              sender: "Other",
              isFile: true,
              filedata: fileData,
              filename: text || "download.bin",
              timestampRealTime,
            }
          : {
              text,
              sender: "Other",
              isFile: false,
              timestampRealTime,
            };
  
        return {
          ...prevMessages,
          [senderId]: [...(prevMessages[senderId] || []), newMessage],
        };
      });
    };
  
    socket.on("receiveMessage", handleMessage);
  
    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [selectedMember?.userid]);  

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file && selectedMember) {
        const fileType = file.type;

        const supportedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv'];
        const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/svg+xml'];
        const supportedDocumentTypes = [
            'application/msword',       // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel',  // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/pdf'           // .pdf
        ];
        const supportedZipTypes = ['application/zip', 'application/x-rar-compressed'];
        
        const supportedExecutableTypes = [
            'application/x-msdownload', 
            'application/x-msdos-program',
            'application/x-sh',
            'application/x-bat', 
            'application/x-msdos-program', 
            'application/x-executable', 
            'application/x-msi',
        ];

        if (supportedVideoTypes.includes(fileType)) {
            const fileUrl = URL.createObjectURL(file); // Video preview URL
            handleSendMessage(`${file.name} (Video)`, true, file, fileUrl);

        } else if (supportedImageTypes.includes(fileType)) {
            const fileUrl = URL.createObjectURL(file); // Image preview URL
            handleSendMessage(`${file.name} (Image)`, true, file, fileUrl);

        } else if (supportedDocumentTypes.includes(fileType)) {
            handleSendMessage(`${file.name} (Document)`, true, file);

        } else if (supportedZipTypes.includes(fileType)) {
            handleSendMessage(`${file.name} (Zip File)`, true, file);

        } else if (supportedExecutableTypes.includes(fileType)) {
            handleSendMessage(`${file.name} (Executable File)`, true, file);

        } else {
            toast.error("Unsupported File Type!")
        }
    }
};
  
  useEffect(() => {
    const lastMessage = messageContainerRef.current?.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, selectedMember]);
  
  return (
    <Container maxWidth="xl" disableGutters sx={{ height: "100vh", display: "flex" }}>
      <Grid container sx={{ height: "100vh", flexWrap: "nowrap" }}>
        <Grid
          sx={{
            display: "flex",
            position: isMobile ? "fixed" : "relative",
            bottom: 0,
            left: 0,
            zIndex: isMobile ? 1300 : 1200,
            width: isMobile ? "100vw" : "auto",
            height: isMobile ? "80vh" : "auto",
            backgroundColor: isMobile ? theme.palette.background.paper : "transparent",
            transform: isMobile
              ? selectedMember
                ? "translateY(100%)"
                : "translateY(0%)"
              : "none",
            transition: isMobile ? "transform 0.4s ease-in-out" : "none",
            mr: isMobile ? 0 : 2.5,
            ml: {
              xs: 0,
              sm: "0.8rem",
              md: "1rem",
              lg: "1.5rem",
            },
            borderTopLeftRadius: isMobile ? 10 : 0,
            borderTopRightRadius: isMobile ? 10 : 0,
            boxShadow: isMobile ? "0 -4px 20px rgba(0,0,0,0.2)" : "none",
            overflow: isMobile ? "hidden" : "initial",
          }}
        >
          <Sidebar
            members={members}
            setMembers={setMembers}
            selectedMember={selectedMember}
            onSelect={handleSelectMember}
            setChatId={setChatId}
            setChatHistory={setMessages}
          />
        </Grid>

        {(!isMobile || (isMobile && selectedMember)) && (
          <Grid
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 2,
              height: "100%",
              backgroundColor: theme.palette.background.default,
              width: "100vw",
            }}
          >
            {selectedMember ? (
              <>
                {isMobile && (
                  <>
                    {selectedMember && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowUpIcon />}
                          onClick={() => setSelectedMember(null)}
                          sx={{
                            mb: 2,
                            alignSelf: 'flex-start',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                              borderColor: 'primary.main',
                            },
                            mr: 1,
                          }}
                        >
                          List
                        </Button>
                      </Box>
                    )}
                  </>
                )}
                <ChatHeader selectedMember={selectedMember} theme={theme} />
                <ChatMessages
                  messages={messages}
                  selectedMember={selectedMember}
                  messageContainerRef={messageContainerRef}
                  theme={theme}
                />
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleFileUpload={handleFileUpload}
                />
              </>
            ) : (
              !isMobile && (
                <Typography variant="h6" sx={{ textAlign: "center", mt: "40vh" }}>
                  Select a member to start chatting&nbsp;
                  <img
                    src={talkinggif}
                    alt="chatting"
                    style={{
                      verticalAlign: "middle",
                      width: "4rem",
                      height: "4rem",
                      backgroundColor: "transparent",
                    }}
                  />
                </Typography>
              )
            )}
          </Grid>
        )}
      </Grid>
    </Container>
  );  
};

export default Chat;
