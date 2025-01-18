import { Box } from "@mui/material";
import { useEffect } from "react";
// import { Box, Button, useTheme } from "@mui/material";
// import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
// import { tokens } from "../theme";
import Header from "../components/header";
import userAuthStore from "../store/authStore";
import CalenderPage from "./CalenderPage";
import RobotStatus from "../components/RobotState";
import robotStore from "../store/robotStore";

const Dashboard = () => {
  // const theme = useTheme();
  // const colors = tokens(theme.palette.mode);
  const { isLoading, isConnected, isAuth, state, checkConnection } =
    robotStore();
  const { user, isAuthenticated } = userAuthStore();

  useEffect(() => {
    checkConnection();
  }, [isConnected]);

  return (
    <Box p="20px">
      <Box mb="20px">
        <Header title="Dashboard" subtitle="Welcome Dashboard" />
      </Box>

      <Box display="grid" gridTemplateColumns="1fr 1fr">
        <Box gridColumn="span 2">
          <RobotStatus
            currentState={state}
            isLoading={isLoading}
            isConnected={isConnected}
            isAuth={isAuth}
            user={user}
            isAuthenticated={isAuthenticated}
          />
        </Box>
        <Box gridColumn="span 1">
          <CalenderPage />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
