// import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import robotStore from "../store/robotStore";

const AmclPoseDisplay = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { position } = robotStore();

  return (
    <Box>
      <Typography variant="h3" color={colors.greenAccent[400]} mb="20px">
        Robot Current Position
      </Typography>

      <Box sx={{ mb: "12px" }}>
        <Typography variant="h4" color={colors.grey[300]}>
          X Position:
        </Typography>
        <Typography color={colors.greenAccent[400]}>{position.x} m</Typography>
      </Box>

      <Box sx={{ mb: "12px" }}>
        <Typography variant="h4" color={colors.grey[300]}>
          Y Position:
        </Typography>
        <Typography color={colors.greenAccent[400]}>{position.y} m</Typography>
      </Box>

      <Box sx={{ mb: "12px" }}>
        <Typography variant="h4" color={colors.grey[300]}>
          Heading:
        </Typography>
        <Typography color={colors.greenAccent[400]}>{position.yaw}°</Typography>
      </Box>
    </Box>
  );
};

export default AmclPoseDisplay;
