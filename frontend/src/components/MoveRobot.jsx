import { Box } from "@mui/material";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  StopCircle,
} from "lucide-react";
import PropTypes from "prop-types";

const buttonClasses =
  "w-full p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center";

const MoveRobot = ({ sendMoveCommand }) => {
  return (
    <Box className="grid grid-cols-3 gap-4 mb-8">
      <Box className="col-start-2">
        <button
          className={buttonClasses}
          onClick={() => sendMoveCommand("forward")}
        >
          <ChevronUp size={24} />
        </button>
      </Box>

      <Box className="col-start-1">
        <button
          className={buttonClasses}
          onClick={() => sendMoveCommand("left")}
        >
          <ChevronLeft size={24} />
        </button>
      </Box>
      <Box className="col-start-2">
        <button
          className={buttonClasses}
          onClick={() => sendMoveCommand("stop")}
          style={{ background: "red" }}
        >
          <StopCircle />
        </button>
      </Box>
      <Box className="col-start-3">
        <button
          className={buttonClasses}
          onClick={() => sendMoveCommand("right")}
        >
          <ChevronRight size={24} />
        </button>
      </Box>
      <Box className="col-start-2">
        <button
          className={buttonClasses}
          onClick={() => sendMoveCommand("backward")}
        >
          <ChevronDown size={24} />
        </button>
      </Box>
    </Box>
  );
};

MoveRobot.propTypes = {
  sendMoveCommand: PropTypes.func.isRequired,
};

export default MoveRobot;
