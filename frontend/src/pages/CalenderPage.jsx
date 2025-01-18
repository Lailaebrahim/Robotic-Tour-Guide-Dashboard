import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "../components/Modal";
import TourDisplay from "../components/TourDisplay";
import tourStore from "../store/tourStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import userAuthStore from "../store/authStore";
import Header from "../components/header";

const CalenderPage = () => {
  const { tours, getTours } = tourStore();
  const { user, isAuthenticated, checkAuth } = userAuthStore();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [isViewTourModalOpen, setIsViewTourModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTours = async (start, end) => {
    try {
      const res = await getTours(start, end);
      if (res instanceof Error) {
        throw res;
      }
    } catch (error) {
      console.error("Error fetching Tours:", error);
      if (error === "TokenExpiredError") {
        checkAuth();
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && user) {
        fetchTours(dateRange.start, dateRange.end);
      } else {
        const res = await checkAuth();
        if (res instanceof Error) {
          navigate("/login");
        }
      }
    };
    fetchData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTours(dateRange.start, dateRange.end);
    }
  }, []);

  const calendarEvents = tours.map((tour) => ({
    id: tour._id,
    title: tour.title,
    start: tour.start,
    end: tour.end,
    allDay: tour.allDay,
    extendedProps: {
      description: tour.description,
      language: tour.language,
      groupAvgAge: tour.groupAvgAge,
      maxGroupSize: tour.maxGroupSize,
      duration: tour.duration,
    },
  }));

  const renderEventContent = (eventInfo) => {
    return (
      <Box
        style={{
          wordWrap: "break-word",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        maxWidth={"100%"}
      >
        <Typography variant="body1" noWrap>
          {eventInfo.event.title}
        </Typography>
        <Typography variant="body2" noWrap>
          Language: {eventInfo.event.extendedProps.language}
        </Typography>
      </Box>
    );
  };

  // eslint-disable-next-line no-unused-vars
  const handleDatesSet = async (dateInfo) => {
    setDateRange({
      start: dateInfo.start.toISOString(),
      end: dateInfo.end.toISOString(),
    });
    fetchTours(dateInfo.start, dateInfo.end);
  };

  const handleEventClick = async (clickInfo) => {
    const event = tours.find((tour) => tour._id === clickInfo.event.id);
    setSelectedEvent(event);
    setIsViewTourModalOpen(true);
  };

  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="All The Past & Upcoming Tours" />
      <Modal
        isOpen={isViewTourModalOpen}
        onClose={() => setIsViewTourModalOpen(false)}
        title="Tour Details"
      >
        <TourDisplay tour={selectedEvent} />
      </Modal>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        timeZone="Africa/Cairo"
        displayEventTime={true}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          meridiem: "short",
        }}
        firstDay={6}
        nowIndicator={true}
        events={calendarEvents}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        height="800px"
        initialView="dayGridMonth"
        editable={false}
        selectable={false}
        selectMirror={true}
        dayMaxEvents={true}
      />
    </Box>
  );
};

export default CalenderPage;
