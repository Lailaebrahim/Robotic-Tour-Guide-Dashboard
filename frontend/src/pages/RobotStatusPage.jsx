import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { RepeatRounded, Stream } from "@mui/icons-material";
import toast from "react-hot-toast";
import Header from "../components/header";
import MotionButton from "../components/MotionButton";
import robotStore from "../store/robotStore";
import userAuthStore from "../store/authStore";
// import TeleoperationPanel from "../components/TeleoperationPanel";
import AmclPoseDisplay from "../components/AmclPoseDisplay";
import RobotStatus from "../components/RobotState";
import { ArrowDown, Volume2 } from "lucide-react";
import tourStore from "../store/tourStore";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Start } from "@mui/icons-material";
import TourDisplay from "../components/TourDisplay";
import MoveRobot from "../components/MoveRobot";
// import { Helmet } from "react-helmet";

const RobotStatusPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {
    isLoading,
    isConnected,
    checkConnection,
    isAuth,
    state,
    startTour,
    streamAudio,
  } = robotStore();
  const { user, isAuthenticated } = userAuthStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const { tours, getTours, generateTourAudio } = tourStore();

  useEffect(() => {
    checkConnection();
  }, [isConnected]);

  useEffect(() => {
    const start = new Date().toISOString().split("T")[0] + "T00:00:00.000Z";
    const end = new Date().toISOString().split("T")[0] + "T24:00:00.000Z";
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

  const handleTourStart = async (tourId) => {
    try {
      console.log("Starting tour with id:", tourId);
      const res = await startTour(tourId);
      console.log(res);
      toast.success("Tour Started successfully !");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAudioStream = async (tourId) => {
    try {
      await streamAudio(tourId);
      toast.success("Audio Streamed successfully !");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const start = new Date().toISOString().split("T")[0] + "T00:00:00.000Z";
    const end = new Date().toISOString().split("T")[0] + "T23:59:59.999Z";
    getTours(start, end);
  }, []);

  return (
    <Box m="20px">
      <Header title="Robot Status" subtitle="" />
      <RobotStatus
        currentState={state || "at home"}
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

                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="20px"
                >
                  {/* Condition for users with control */}
                  {tour.isAudioGenerated && user.hasControl ? (
                    <>
                      {tour.isAudioStreamed ? (
                        <MotionButton
                          isLoading={isLoading}
                          bool={true}
                          title1="Start Tour"
                          Icon1={Start}
                          type="button"
                          onClick={() => handleTourStart(tour._id)}
                        />
                      ) : (
                        <>
                          <MotionButton
                            isLoading={isLoading}
                            bool={true}
                            title1="Stream Audios"
                            Icon1={Stream}
                            type="button"
                            onClick={() => handleAudioStream(tour._id)}
                          />
                          <MotionButton
                            isLoading={isLoading}
                            bool={true}
                            title1="Regenerate Audios"
                            Icon1={RepeatRounded}
                            type="button"
                            onClick={() => handleAudioGeneration(tour._id)}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    // Condition for users without control or when audio is not generated
                    !tour.isAudioGenerated && (
                      <MotionButton
                        isLoading={isLoading}
                        bool={true}
                        title1="Generate Audio"
                        Icon1={Volume2}
                        type="button"
                        onClick={() => handleAudioGeneration(tour._id)}
                      />
                    )
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        mt="40px"
        width={"100%"}
        padding="30px"
        display="grid"
        gridTemplateColumns="1fr 1fr"
        sx={{
          border: "2px solid grey",
        }}
        gap="100px"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          height="100%"
        >
          <Box>
            <AmclPoseDisplay />
          </Box>
        </Box>
        <Box>
          <MoveRobot />
        </Box>

        {/* <Box>
          <TeleoperationPanel />
        </Box> */}
      </Box>
    </Box>
  );
};

export default RobotStatusPage;
