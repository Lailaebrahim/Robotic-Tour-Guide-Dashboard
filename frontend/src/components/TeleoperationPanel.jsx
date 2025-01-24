import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { MapPin } from "lucide-react";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const TeleoperationPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [activePosition, setActivePosition] = useState(null);
  const positions = [
    { id: 1, name: "POI 1" },
    { id: 2, name: "POI 2" },
    { id: 3, name: "POI 3" },
    { id: 4, name: "POI 4" },
    { id: 5, name: "POI 5" },
  ];

  return (
    <Box className="grid grid-cols-1 gap-2">
      <Typography variant="h3" color={colors.greenAccent[400]} mb="20px">
        Go To
      </Typography>
      {positions.map((pos) => (
        <button
          key={pos.id}
          className={`p-3 flex items-center gap-2 rounded-lg ${
            activePosition === pos.id
              ? "bg-green-500 text-white"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={() => setActivePosition(pos.id)}
        >
          <MapPin size={18} />
          <span>{pos.name}</span>
        </button>
      ))}
    </Box>
  );
};

export default TeleoperationPanel;
