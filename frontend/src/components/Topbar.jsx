import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ColorModeContext, tokens } from "../theme";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import userAuthStore from "../store/authStore";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  // use the context to get toggle mode function
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { logout } = userAuthStore();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await logout();
      if (res instanceof Error) {
        throw res;
      }
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box display="flex" justifyContent="flex-end" p={2}>
      {/* Topbar Icons */}
      <Box display="flex" color="white">
        <IconButton
          sx={{ color: colors.primary[100] }}
          onClick={colorMode.toggleColorMode}
        >
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton sx={{ color: colors.primary[100] }}>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton sx={{ color: colors.primary[100] }}>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton
          sx={{ color: colors.primary[100] }}
          onClick={(e) => {
            handleLogout(e);
          }}
        >
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
