import { Box } from "@mui/material";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  StopCircle,
} from "lucide-react";
import robotStore from "../store/robotStore";
import tourStore from "../store/tourStore";

const MoveRobot = () => {
  const { sendMoveCommand, isLoading, isConnected } = robotStore();
  const { isLoading: isTourLoading } = tourStore();

  const getButtonClasses = (isStopButton = false, isHomeButton = false) => {
    let classes =
      "w-full p-4 text-white rounded-lg flex items-center justify-center";

    if (isLoading || isTourLoading || !isConnected) {
      classes += " opacity-50 cursor-not-allowed";
    } else {
      if (isStopButton) {
        classes += " bg-red-500 hover:bg-red-600";
      } else if (isHomeButton) {
        classes += " bg-green-500 hover:bg-green-600";
      } else {
        classes += " bg-blue-500 hover:bg-blue-600";
      }
    }

    return classes;
  };

  return (
    <Box className="grid grid-cols-3 gap-4 mb-8">
      <Box className="col-start-2">
        <button
          className={getButtonClasses()}
          onClick={() => sendMoveCommand("forward")}
          disabled={isLoading}
        >
          <ChevronUp size={24} />
        </button>
      </Box>
      <Box className="col-start-1">
        <button
          className={getButtonClasses()}
          onClick={() => sendMoveCommand("left")}
          disabled={isLoading}
        >
          <ChevronLeft size={24} />
        </button>
      </Box>
      <Box className="col-start-2">
        <button
          className={getButtonClasses(true)}
          onClick={() => sendMoveCommand("stop")}
          disabled={isLoading}
        >
          <StopCircle />
        </button>
      </Box>
      <Box className="col-start-3">
        <button
          className={getButtonClasses()}
          onClick={() => sendMoveCommand("right")}
          disabled={isLoading}
        >
          <ChevronRight size={24} />
        </button>
      </Box>
      <Box className="col-start-2">
        <button
          className={getButtonClasses()}
          onClick={() => sendMoveCommand("backward")}
          disabled={isLoading}
        >
          <ChevronDown size={24} />
        </button>
      </Box>
      <Box className="col-span-3 mt-4">
        <button
          className={getButtonClasses(false, true)}
          onClick={() => sendMoveCommand("home")}
          disabled={isLoading}
        >
          🏠 Home
        </button>
      </Box>
    </Box>
  );
};

export default MoveRobot;
