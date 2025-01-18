import React from "react";
import { useTheme } from "@mui/material";
import { Box, Typography } from "@mui/material";
import { Clock, PenTool } from "lucide-react";
import { Language } from "@mui/icons-material";
import TourPOIsDisplay from "./TourPOIsDisplay";
import { tokens } from "../theme";

const TourDisplay = ({ tour }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const formatDate = (dateString) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  return (
    <Box key={tour._id}>
      <Typography
        variant="h4"
        sx={{
          paddingBottom: "10px",
        }}
      >
        {tour.title}
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        color={colors.greenAccent[600]}
        marginBottom="5px"
      >
        <Clock
          size={18}
          style={{ opacity: 0.7, flexShrink: 0, alignSelf: "flex-start" }}
        />
        <Typography
          variant="body1"
          sx={{
            fontSize: "0.9rem",
            opacity: 0.8,
            marginRight: "10px",
          }}
        >
          {formatDate(tour.start)} - {formatDate(tour.end)}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap="8px" marginBottom="5px">
        <PenTool
          size={18}
          style={{ opacity: 0.7, flexShrink: 0, alignSelf: "flex-start" }}
        />
        <Typography
          variant="body1"
          sx={{
            fontSize: "0.875rem",
            lineHeight: 1.6,
            opacity: 0.7,
          }}
        >
          {tour.description}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap="8px" marginBottom="5px">
        <Language
          size={18}
          style={{ opacity: 0.7, flexShrink: 0, alignSelf: "flex-start" }}
        />
        <Typography
          variant="body1"
          sx={{
            fontSize: "0.875rem",
            lineHeight: 1.6,
            opacity: 0.7,
          }}
        >
          {tour.language}
        </Typography>
      </Box>

      <Box margin="10px 0px">
        <TourPOIsDisplay
          isAudioGenerated={tour.isAudioGenerated}
          museumMap={tour.museumMap}
        />
      </Box>
    </Box>
  );
};

export default TourDisplay;
