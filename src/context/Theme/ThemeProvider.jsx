import { createTheme } from "@mui/material/styles";

export const getDesignTokens = (mode) => ({
  typography: {
    fontFamily: "Verdana, sans-serif",
  },
  palette: {
    mode,
    background: {
      default: mode === "light" ? "#FAF9F6" : "#3E3E42", 
    },
    primary: {
      main: "#1976d2",
    },
    text: {
      primary: mode === "light" ? "#000000" : "#ffffff", 
    },
  },
});

export const lightTheme = createTheme(getDesignTokens("light"));
export const darkTheme = createTheme(getDesignTokens("dark"));
