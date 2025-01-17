import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import toast from "react-hot-toast";
import Header from "../components/header";
import MotionButton from "../components/MotionButton";
import robotStore from "../store/robotStore";
import userAuthStore from "../store/authStore";
import Map from "../components/Map";
import RobotStatus from "../components/RobotState";
import { ArrowDown, Volume2 } from "lucide-react";
import tourStore from "../store/tourStore";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Start } from "@mui/icons-material";
import TourDisplay from "../components/TourDisplay";
// import { Helmet } from "react-helmet";

const RobotStatusPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { isLoading, isConnected, checkConnection, isAuth, state, startTour } =
    robotStore();
  const { user, isAuthenticated } = userAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const { tours, getTours, generateTourAudio } = tourStore();

  useEffect(() => {
    checkConnection();
  }, [isConnected]);

  useEffect(() => {
    const start = new Date().toISOString().split("T")[0] + "T07:00:00.000Z";
    const end = new Date().toISOString().split("T")[0] + "T19:00:00.000Z";
    getTours(start, end);
  }, [isExpanded]);

  const handleDropDown = () => {
    setIsExpanded((prev) => !prev);
    const start = new Date().toISOString().split("T")[0] + "T07:00:00.000Z";
    const end = new Date().toISOString().split("T")[0] + "T19:00:00.000Z";
    const res = getTours(start, end);
    if (res instanceof Error) {
      console.log(res.message);
    }
  };

  const handleAudioGeneration = async (tourId) => {
    try {
      await generateTourAudio(tourId);
      toast.success("Audio generated successfully !");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //
  const handleTourStart = async (tourId) => {
    try {
      console.log("Starting tour with id:", tourId);
      const res = await startTour(tourId);
      console.log(res);
      toast.success("Tour started successfully !");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box m="20px">
      <Header title="Robot Status" subtitle="" />
      <RobotStatus
        currentState={state}
        isLoading={isLoading}
        isConnected={isConnected}
        isAuth={isAuth}
        user={user}
        isAuthenticated={isAuthenticated}
      />
      <Box mt="40px" border="2px solid" borderColor="gray" overflow="hidden">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p="20px"
          sx={{ cursor: "pointer" }}
          onClick={handleDropDown}
          borderBottom={isExpanded ? "2px solid" : "none"}
          borderColor="gray"
        >
          {tours && tours.length > 0 ? (
            <>
              <Typography variant="h3">Today&apos;s Tours</Typography>
              <ArrowDown
                style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </>
          ) : (
            <Typography variant="h3">No Tours Today</Typography>
          )}
        </Box>

        <Box
          sx={{
            height: isExpanded ? "auto" : "0px",
            opacity: isExpanded ? 1 : 0,
            transition: "all 0.3s ease",
            overflow: "hidden",
          }}
        >
          <Box display="grid" gridTemplateColumns="1fr">
            {tours.map((tour) => (
              <Box
                key={tour._id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  p: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    backgroundColor: colors.blueAccent[800],
                  },
                }}
              >
                <TourDisplay tour={tour} />

                <Box display="flex" justifyContent="center" alignItems="center">
                  {tour.isAudioGenerated ? (
                    user.hasControl ? (
                      <MotionButton
                        isLoading={false}
                        bool={true}
                        title1="Start Tour"
                        Icon1={Start}
                        type="button"
                        onClick={() => handleTourStart(tour._id)}
                      />
                    ) : null
                  ) : (
                    <MotionButton
                      isLoading={isLoading}
                      bool={true}
                      title1="Generate Audio"
                      Icon1={Volume2}
                      onClick={() => handleAudioGeneration(tour._id)}
                    />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box mt="40px">
        <Map />
      </Box>
    </Box>
  );
};

export default RobotStatusPage;
