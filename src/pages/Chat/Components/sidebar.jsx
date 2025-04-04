import { useTheme } from "@mui/material/styles";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Box,
  useMediaQuery,
} from "@mui/material";

const Sidebar = ({ members, selectedMember, onSelect }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper, // Keep the default background
        p: 2,
        borderRight: `1px solid ${theme.palette.divider}`, // Subtle divider line
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
        Members
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: "auto", mt: 1 }}>
        <List>
          {members.map((member, index) => (
            <ListItem
              key={index}
              button
              selected={selectedMember?.name === member.name}
              onClick={() => onSelect(member)}
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: 2,
                mb: 1,
                backgroundColor:
                  selectedMember?.name === member.name
                    ? theme.palette.action.selected
                    : "transparent",
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover, // Subtle hover effect
                },
                transition: "background-color 0.3s", // Smooth transition for hover
              }}
            >
              <Avatar src={member.avatar} sx={{ mr: 2 }} />
              <ListItemText
                primary={member.name}
                sx={{ color: theme.palette.text.primary }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
