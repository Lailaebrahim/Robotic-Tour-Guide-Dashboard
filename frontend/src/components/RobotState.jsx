import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";
import {
  Settings,
  DirectionsRun,
  Chat,
  Coffee,
  SecurityOutlined,
  Error,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import MotionButton from "./MotionButton";
import PropTypes from "prop-types";

const stateConfigs = {
  CONFIG: {
    colors: "from-blue-500 to-blue-800",
    icon: Settings,
    text: "Configuring",
    animate: "animate-spin",
  },
  MOVING: {
    colors: "from-yellow-500 to-yellow-800",
    icon: DirectionsRun,
    text: "moving",
    animate: "animate-bounce",
  },
  INTERACTING: {
    colors: "from-purple-500 to-purple-800",
    icon: Chat,
    text: "describing at POI\\d+",
    animate: "animate-pulse",
  },
  ERROR: {
    colors: "from-red-500 to-red-800",
    icon: Error,
    text: "Error",
    animate: "animate-ping",
  },
  AtHome: {
    colors: "from-green-500 to-green-800",
    icon: Coffee,
    text: "at home",
  },
  "moving forward": {
    colors: "from-yellow-500 to-yellow-800",
    icon: DirectionsRun,
    text: "moving forward",
    animate: "animate-bounce",
  },
  "moving left": {
    colors: "from-yellow-500 to-yellow-800",
    icon: DirectionsRun,
    text: "moving left",
    animate: "animate-bounce",
  },
  "moving right": {
    colors: "from-yellow-500 to-yellow-800",
    icon: DirectionsRun,
    text: "moving right",
    animate: "animate-bounce",
  },
  "moving backward": {
    colors: "from-yellow-500 to-yellow-800",
    icon: DirectionsRun,
    text: "moving backward",
    animate: "animate-bounce",
  },
  "moving stop": {
    colors: "from-green-500 to-green-800",
    icon: Coffee,
    text: "stopped",
  },
};

const RobotState = ({
  currentState,
  isLoading,
  isConnected,
  isAuth,
  user,
  isAuthenticated,
}) => {
  const config = stateConfigs[currentState] || stateConfigs.AtHome;
  const IconComponent = config.icon;

  return (
    <Box display="flex" justifyContent="space-around" gap="20px">
      <MotionButton
        isLoading={isLoading}
        bool={isConnected && isAuth}
        title1={"Connected"}
        Icon1={SecurityOutlined}
        title2={"Not Connected"}
        Icon2={Error}
      />
      {isConnected ? (
        <motion.div
          key={currentState}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`mt-5 w-full py-3 px-4 bg-gradient-to-r ${config.colors} 
          font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 
          transition duration-200 flex justify-center items-center`}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <IconComponent className={config.animate || ""} />
            <Typography>{config.text || currentState}</Typography>
          </Box>
        </motion.div>
      ) : null}
      {user &&
      isAuthenticated &&
      (user.role === "admin" || user.role === "robotOperator") ? (
        <MotionButton
          isLoading={isLoading}
          bool={user.hasControl}
          Icon1={Lock}
          title1="You have Control"
          Icon2={LockOpen}
          title2="You don't have Control"
        />
      ) : null}
    </Box>
  );
};

RobotState.propTypes = {
  currentState: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  isAuth: PropTypes.bool.isRequired,
  user: PropTypes.object,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default RobotState;
