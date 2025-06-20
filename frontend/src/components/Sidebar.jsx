import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import userAuthStore from "../store/authStore";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import TourIcon from "@mui/icons-material/Tour";

const SideBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const { user, isAuthenticated } = userAuthStore();
  const navigate = useNavigate();

  const Item = ({ title, to, icon, selected, setSelected }) => {
    return (
      <MenuItem
        active={selected === title}
        style={{ color: colors.grey[100] }}
        onClick={() => setSelected(title)}
        icon={icon}
        /*  Using the component prop tells the MenuItem to use the Link as its root element
         *   this wraps the entire MenuItem content inside a Router Link. */
        component={<Link to={to} />}
      >
        <Typography>{title}</Typography>
      </MenuItem>
    );
  };

  if (!user || !isAuthenticated) {
    return null;
  }

  // Rest of the component remains the same...
  return (
    <Box
      style={{ border: "none" }}
      height="100%"
      marginBottom="0px"
      overflow="y"
    >
      <ProSidebar
        collapsed={isCollapsed}
        collapsedWidth="60px"
        rootStyles={{
          borderRight: "none",
          ".ps-sidebar-container": {
            background: `${colors.primary[400]} !important`,
            height: "100vh",

            borderRightWidth: "0px",
          },
          ".ps-menu-button": {
            padding: "5px 35px 5px 20px !important",
            "&:hover": {
              background: `${colors.primary[500]} !important`,
            },
          },
        }}
      >
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "20px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}></Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* Logged in Admin Data */}
          {!isCollapsed && (
            <Box>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="Admin-profile-Picture"
                  width="100px"
                  height="100px"
                  src={user.profile}
                  style={{
                    borderRadius: "50%",
                    border: `2px solid ${colors.primary[400]}`,
                    boxShadow: `5px 5px 10px ${colors.primary[500]}`,
                    cursor: "pointer",
                  }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "20px 0 0 0" }}
                >
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography
                  variant="h5"
                  color={colors.greenAccent[500]}
                  sx={{ m: "10px 0 20px 0" }}
                >
                  {user.role}
                </Typography>
              </Box>
            </Box>
          )}

          {/*Menu items */}
          <Box>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title="Manage Team"
              to="/dashboard/team"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Manage Tours"
              to="/dashboard/tours"
              icon={<TourIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Robot Status"
              to="/dashboard/robot-status"
              icon={<SmartToyOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="Profile Form"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Calendar"
              to="/dashboard/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Museum Map"
              to="/map"
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="ChatBot"
              to="http://localhost:3000/"
              icon={<ChatOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="FAQ Page"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default SideBar;
