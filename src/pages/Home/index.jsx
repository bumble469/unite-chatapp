import { Container, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/unite-logo.jpg"; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        margin: "0 auto",
      }}
    >
      <Box 
        component="img"
        src={logo}
        alt="Unite Logo"
        sx={{
          width: "150px",  
          height: "150px",
          objectFit: "contain", 
          mb: 3,  
        }}
      />

      <Typography variant="h3" gutterBottom>
        Welcome to Unite!
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph>
        Stay connected with your friends and colleagues in real-time.
      </Typography>

      <Box mt={4}>
        <Button variant="contained" color="primary" size="large" onClick={() => navigate("/auth")}>
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
