import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  IconButton,
  InputAdornment,
  Modal,
  CircularProgress
} from "@mui/material";
import axios from 'axios';
import { useState } from "react";
import { Visibility, VisibilityOff, Clear } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isOtpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempUserId, setTempUserId] = useState();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  const openOtpModal = () => {
    setOtpModalOpen(true);
  };

  const closeOtpModal = () => {
    setOtpModalOpen(false);
  };

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Invalid email format";
    }

    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    if (isSignup) {
      if (!username.trim()) {
        tempErrors.username = "Username is required";
      }

      if (!firstName.trim()) {
        tempErrors.firstName = "First Name is required";
      }

      if (!lastName.trim()) {
        tempErrors.lastName = "Last Name is required";
      }

      if (!mobile.trim()) {
        tempErrors.mobile = "Mobile is required";
      }

      if (!confirmPassword) {
        tempErrors.confirmPassword = "Confirm Password is required";
      } else if (password !== confirmPassword) {
        tempErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) return;
  
    if (isSignup) {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("username", username);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("mobile", mobile);
      if (profileImage) {
        formData.append("profilePhoto", profileImage);
      }
  
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/auth/signup`, {
          method: "POST",
          body: formData,
        });
  
        const data = await res.json();
  
        if (res.ok) {
          setEmail("");
          setUsername("");
          setFirstName("");
          setLastName("");
          setMobile("");
          setPassword("");
          setConfirmPassword("");
          setProfileImage(null);
          setPreviewUrl(null);
          setTempUserId(null);
    
          setIsSignup(!isSignup);
        } else {
          toast.error(data.message || "Signup failed.");
        }
  
        setLoading(false);
      } catch (err) {
        console.error("Signup error:", err);
        setLoading(false);
        toast.error("Something went wrong during signup.");
      }
    } else {
      try {
        setLoading(true);
        const res = await axios.post(`${apiUrl}/api/auth/login`, {
          email,
          password,
        });
  
        if (res.status === 200) {
          localStorage.setItem("userId", res.data.user.userID);
          setEmail("");
          setPassword("");
          navigate("/chat");
          toast.success("Login successful!");
        } else {
          toast.error(res.data.message || "Login failed.");
        }
  
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Login error:", err.response ? err.response.data : err.message);
        toast.error(
          err.response?.data?.message || err.message || "Unknown error occurred"
        );
      }
    }
  };
  
  // const handleOtpVerify = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.post(`${apiUrl}/api/auth/verify-otp`, {
  //       otp,
  //       email,
  //     });
  
  //     if (res.status === 200) {
  //       toast.success("OTP Verified! Signup completed.");
  //       localStorage.setItem("userId", tempUserId);
  //       closeOtpModal();
  
  //       setOtp("");
  //       setIsSignup(false);
  //       setEmail("");
  //       setUsername("");
  //       setFirstName("");
  //       setLastName("");
  //       setMobile("");
  //       setPassword("");
  //       setConfirmPassword("");
  //       setProfileImage(null);
  //       setPreviewUrl(null);
  //       setTempUserId(null);
  
  //       setIsSignup(!isSignup);
  //     } else {
  //       toast.error("Invalid OTP.");
  //     }
  //     setLoading(false);
  //   } catch (err) {
  //     setLoading(false);
  //     toast.error(
  //       err.response?.data?.message || err.message || "OTP Verification Failed"
  //     );
  //   }
  // };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 2, sm: 4 },
          width: "100%",
          maxWidth: "400px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <ToggleButtonGroup
          value={isSignup ? "signup" : "login"}
          exclusive
          onChange={() => {
            setIsSignup(!isSignup);
            setErrors({});
          }}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="login">Login</ToggleButton>
          <ToggleButton value="signup">Signup</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="h5" gutterBottom>
          {isSignup ? "Sign Up" : "Login"}
        </Typography>

        <Box
          component="form"
          display="flex"
          flexDirection="column"
          gap={2}
          width="100%"
        >{loading && (
          <Box mt={2} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
          )}
          {isSignup && (
            <>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
              />
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
              />
              <TextField
                label="Mobile"
                variant="outlined"
                fullWidth
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                error={Boolean(errors.mobile)}
                helperText={errors.mobile}
              />
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={Boolean(errors.username)}
                helperText={errors.username}
                InputProps={{
                  endAdornment: username && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setUsername("")}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            InputProps={{
              endAdornment: email && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setEmail("")}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {password && (
                    <IconButton onClick={() => setPassword("")}>
                      <Clear />
                    </IconButton>
                  )}
                  <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {isSignup && (
            <>
              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {confirmPassword && (
                        <IconButton onClick={() => setConfirmPassword("")}>
                          <Clear />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button variant="outlined" component="label">
                Upload Profile Photo (Optional)
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>

              {previewUrl && (
                <Avatar
                  src={previewUrl}
                  alt="Preview"
                  sx={{ width: 80, height: 80, mx: "auto", mt: 1 }}
                />
              )}
            </>
          )}

          <Button variant="contained" color="primary" fullWidth onClick={handleAuth}>
            {isSignup ? "Sign Up" : "Login"}
          </Button>
        </Box>
      </Paper>
      {/* {isOtpModalOpen && (
        <Modal
          open={isOtpModalOpen}
          onClose={closeOtpModal}
          aria-labelledby="otp-modal-title"
          aria-describedby="otp-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography id="otp-modal-title" variant="h6" component="h2">
              Enter OTP
            </Typography>
            <TextField
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
            />
            <Button variant="contained" color="primary" onClick={handleOtpVerify}>
              Verify OTP
            </Button>
          </Box>
        </Modal>
      )} */}
    </Container>
  );
};

export default Auth;
