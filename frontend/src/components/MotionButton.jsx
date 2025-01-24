import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import tourStore from "../store/tourStore";
import robotStore from "../store/robotStore";
import { Volume2 } from "lucide-react";
import { Stream } from "@mui/icons-material";

const MotionButton = ({
  isLoading,
  bool,
  Icon1,
  title1,
  Icon2,
  title2,
  onClick,
  className = "",
  type = "button",
}) => {
  const baseClassName =
    "mt-5 w-full py-3 px-4 font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 text-center flex items-center justify-center space-x-2";

  const { isLoading: isTourLoading } = tourStore();
  const { isLoading: isRobotLoading } = robotStore();

  if (
    (Icon1 === Volume2 && isTourLoading) ||
    (Icon1 === Stream && isRobotLoading)
  ) {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        className={`${baseClassName} ${className} bg-gray-500 hover:bg-gray-600 cursor-not-allowed`}
        disabled
      >
        <Loader className="animate-spin" size={24} color="white" />
        <span className="text-white">Loading...</span>
      </motion.button>
    );
  }

  if (bool) {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        className={`${baseClassName} ${className} bg-gradient-to-r from-green-500 to-green-800 hover:from-green-600 hover:to-green-700 focus:ring-green-500`}
      >
        {Icon1 && <Icon1 />}
        <span>{title1}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseClassName} ${className} bg-gradient-to-r from-red-500 to-red-800 hover:from-red-600 hover:to-red-700 focus:ring-red-500`}
    >
      {Icon2 && <Icon2 />}
      <span>{title2}</span>
    </motion.button>
  );
};

export default MotionButton;
