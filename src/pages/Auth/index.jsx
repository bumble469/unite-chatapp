import { Container, TextField, Button, Box, Typography, Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleAuth = () => {
    if (email && password) {
      console.log(isSignup ? "Signing up..." : "Logging in...");
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
          position: "relative", 
        }}
      >

        <ToggleButtonGroup
          value={isSignup ? "signup" : "login"}
          exclusive
          onChange={() => setIsSignup(!isSignup)}
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
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignup && (
            <TextField label="Confirm Password" type="password" variant="outlined" fullWidth />
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
