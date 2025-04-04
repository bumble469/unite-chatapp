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
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff, Clear } from "@mui/icons-material";

const Auth = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

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
      if (profileImage) {
        formData.append("profilePhoto", profileImage);
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          alert("Signup successful!");
          setIsSignup(false);
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setProfileImage(null);
          setPreviewUrl(null);
        } else {
          alert(data.message || "Signup failed.");
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("Something went wrong during signup.");
      }
    } else {
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok) {
          alert("Login successful!");
          setEmail("");
          setPassword("");
          navigate("/chat"); // 🔁 Redirect on login success
        } else {
          alert(data.message || "Login failed.");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong during login.");
      }
    }
  };

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
      maxWidth={false}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          width: "100%",
          maxWidth: "400px",
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

        <Box component="form" display="flex" flexDirection="column" gap={2} width="100%">
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
                    {showPassword ? <VisibilityOff /> : <Visibility />}
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
                      <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
    </Container>
  );
};

export default Auth;
