import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import Header from "../components/header";
import { tokens } from "../theme";
import tourStore from "../store/tourStore";
import userAuthStore from "../store/authStore";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import TourDisplay from "../components/TourDisplay";
import { motion } from "framer-motion";
import { Loader, EditIcon, DeleteIcon } from "lucide-react";
import { Info, Users, Clock, Globe, PenTool } from "lucide-react";
import toast from "react-hot-toast";
// import { combineDateTimeToUTC } from "../utils/timeZone";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
// import { Dropdown } from "react-native-element-dropdown";

const ToursPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const {
    tours,
    getTours,
    isLoading,
    error,
    createTour,
    updateTour,
    deleteTour,
  } = tourStore();
  const { user, isAuthenticated, checkAuth } = userAuthStore();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewTourModalOpen, setIsViewTourModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupAvgAge, setGroupAvgAge] = useState("");
  const [maxGroupSize, setMaxGroupSize] = useState("");
  const [duration, setDuration] = useState("");
  const [language, setLanguage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [id, setId] = useState("");
  const navigate = useNavigate();

  // Function to fetch Tours for the current date range
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

  useEffect(() => {
    if (
      !isCreateModalOpen &&
      !isUpdateModalOpen &&
      !isDeleteModalOpen &&
      !isViewTourModalOpen
    ) {
      setSelectedEvent(null);
    }
  }, [
    isCreateModalOpen,
    isUpdateModalOpen,
    isDeleteModalOpen,
    isViewTourModalOpen,
  ]);

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

  const handleDatesSet = async (dateInfo) => {
    setDateRange({
      start: dateInfo.start.toISOString(),
      end: dateInfo.end.toISOString(),
    });
    fetchTours(dateInfo.start, dateInfo.end);
  };

  const handleDateSelect = async (selected) => {
    setIsCreateModalOpen(true);
    setStartDate(selected.startStr);
  };

  const handleCreateTour = async (e) => {
    e.preventDefault();
    console.log(startDate, startTime);
    const cairoMoment = moment.tz(startDate, "Africa/Cairo");
    const utcMoment = cairoMoment.clone().utc();
    const endMoment = utcMoment.clone().add(duration, "minutes");
    // const tourDate = new Date(combineDateTimeToUTC(startDate, startTime));
    // tourDate.setHours(tourDate.getHours() - 2);
    console.log(utcMoment);
    console.log(endMoment);
    const tourData = {
      title,
      description,
      groupAvgAge,
      start: utcMoment.format(),
      end: endMoment.format(),
      duration,
      maxGroupSize,
      language: language || "English",
    };
    const res = await createTour(tourData);
    if (res instanceof Error) {
      toast.error(res.message);
    } else {
      setIsCreateModalOpen(false);
      setSelectedEvent(null);
      setTitle("");
      setDescription("");
      setGroupAvgAge("");
      setMaxGroupSize("");
      setDuration("");
      setLanguage("");
      setStartDate("");
      setStartTime("");
      fetchTours(dateRange.start, dateRange.end);
      toast.success("Tour created successfully!");
    }
  };

  const formatDateTimeForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateChange = (e) => {
    const dateTimeValue = e.target.value;
    const newDate = new Date(dateTimeValue);
    console.log(newDate);
    setStartDate(newDate);
    setStartTime(dateTimeValue.split("T")[1].substring(0, 5));
  };

  const handleEventClick = async (clickInfo) => {
    const event = tours.find((tour) => tour._id === clickInfo.event.id);
    setSelectedEvent(event);
    setIsViewTourModalOpen(true);
  };

  const handleEventDragStart = (eventDragInfo) => {
    console.log("Drag Start");
    const event = tours.find((tour) => tour._id === eventDragInfo.event.id);
    setSelectedEvent(event);
  };

  const handleEventDrop = async (eventDropInfo) => {
    const { event } = eventDropInfo;
    const startUpdate = new Date(event.start);
    const updatedTour = {
      id: selectedEvent.id,
      start: startUpdate.toISOString(),
      end: new Date(
        startUpdate.getTime() + event.extendedProps.duration * 60000
      ).toISOString(),
    };
    const res = await updateTour(event.id, updatedTour);
    if (res instanceof Error) {
      toast.error(res.message);
      eventDropInfo.revert();
    } else {
      toast.success("Tour updated successfully!");
    }
    setSelectedEvent(null);
    await fetchTours(dateRange.start, dateRange.end);
  };

  const handleUpdateTour = async (id) => {
    setIsUpdateModalOpen(true);
    const tour = tours.find((tour) => tour._id === id);
    setSelectedEvent(tour);
    setTitle(tour.title);
    setDescription(tour.description);
    setGroupAvgAge(tour.groupAvgAge);
    setMaxGroupSize(tour.maxGroupSize);
    setDuration(tour.duration);
    setLanguage(tour.language);
    setStartTime(
      new Date(tour.start).toISOString().split("T")[1].substring(0, 5)
    );
    setStartDate(new Date(tour.start));
  };

  const handleUpdateTourSubmit = async (e) => {
    e.preventDefault();
    const updatedTour = {
      title: title,
      description: description,
      groupAvgAge: groupAvgAge,
      start: startDate,
      end: new Date(startDate.getTime() + duration * 60000).toISOString(),
      duration: duration,
      maxGroupSize: maxGroupSize,
    };
    console.log(updatedTour);
    const res = await updateTour(selectedEvent._id, updatedTour);
    if (res instanceof Error) {
      toast.error(error);
    } else {
      toast.success("Tour updated successfully!");
      setIsUpdateModalOpen(false);
      setSelectedEvent(null);
      setTitle("");
      setDescription("");
      setGroupAvgAge("");
      setMaxGroupSize("");
      setDuration("");
      setLanguage("");
      setStartDate("");
      setStartTime("");
      fetchTours(dateRange.start, dateRange.end);
    }
  };

  const handleTourDelete = async (id) => {
    console.log(id);
    setIsDeleteModalOpen(true);
    setId(id);
  };

  const handleTourDeleteSubmit = async (e) => {
    e.preventDefault();
    const res = await deleteTour(id);
    if (res instanceof Error) {
      toast.error(res.message);
    } else {
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
      toast.success("Tour deleted successfully !");
      fetchTours(dateRange.start, dateRange.end);
    }
  };

  return (
    <Box m="20px">
      <Header title="Manage Tours" subtitle="All The Past & Upcoming Tours" />
      <Box display="flex" justifyContent="space-between">
        {user && (user.role === "tourManager" || user.role === "admin") ? (
          <Box
            flex="1 1 20%"
            backgroundColor={colors.primary[400]}
            borderRadius="4px"
            overflow="auto"
            maxHeight="830px"
            p="0px 20px 20px 20px"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              position="sticky"
              top="0"
              backgroundColor={colors.primary[400]}
              zIndex="1"
              p="20px"
            >
              <Typography variant="h4" color={colors.greenAccent[400]}>
                You Recently Added
              </Typography>
            </Box>
            <List>
              {tours &&
                tours.length > 0 &&
                tours
                  .filter(
                    (tour) =>
                      tour.createdBy !== user.id &&
                      new Date(tour.start) > new Date()
                  )
                  .slice(0, 8)
                  .map((tour) => (
                    <ListItem
                      key={tour._id}
                      sx={{
                        backgroundColor: colors.blueAccent[700],
                        margin: "10px 0",
                        borderRadius: "2px",
                      }}
                    >
                      <ListItemText
                        primary={tour.title}
                        secondary={
                          <>
                            <Typography>
                              {formatDate(tour.start, {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              })}
                            </Typography>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              margin="8px 0px 0px 0px"
                            >
                              <EditIcon
                                color={colors.greenAccent[900]}
                                onClick={() => handleUpdateTour(tour._id)}
                              />
                              <DeleteIcon
                                color="red"
                                onClick={() => handleTourDelete(tour._id)}
                              />
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
            </List>
          </Box>
        ) : null}

        <Box flex="1 1 100%" m="25px">
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Schedule a New Tour"
          >
            <form onSubmit={handleCreateTour}>
              <Input
                icon={Info}
                type="text"
                placeholder="title"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                icon={Clock}
                type="datetime-local"
                placeholder="Start Date and Time"
                value={startDate}
                required
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                icon={PenTool}
                type="text"
                placeholder="Description"
                value={description}
                required
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                icon={Users}
                type="number"
                placeholder="Group Average Age"
                value={groupAvgAge}
                required
                onChange={(e) => setGroupAvgAge(e.target.value)}
              />
              <Input
                icon={Users}
                type="number"
                placeholder="Max Group Size"
                value={maxGroupSize}
                required
                onChange={(e) => setMaxGroupSize(e.target.value)}
              />
              <Input
                icon={Clock}
                type="number"
                placeholder="Duration in mins"
                value={duration}
                required
                onChange={(e) => setDuration(e.target.value)}
              />
              <Select
                icon={Globe}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={[
                  { value: "English", label: "English" },
                  { value: "Arabic", label: "Arabic" },
                  { value: "Spanish", label: "Spanish" },
                  { value: "French", label: "French" },
                  { value: "German", label: "German" },
                  { value: "Italian", label: "Italian" },
                ]}
              />
              {error && (
                <p className="text-red-500 text-center text-sm">{error}</p>
              )}
              <motion.button
                className=" w-fit-content py-3 px-8 bg-gradient-to-r from-sky-500 to-sky-800 
            font-bold rounded-lg shadow-lg hover:from-sky-600
            hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
             focus:ring-offset-gray-900 transition duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className=" animate-spin mx-auto" size={24} />
                ) : (
                  "Add"
                )}
              </motion.button>
            </form>
          </Modal>
          <Modal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            title="Update Tour Data"
          >
            <form onSubmit={handleUpdateTourSubmit}>
              <Input
                icon={Info}
                type="text"
                placeholder="title"
                inital={selectedEvent && selectedEvent.title}
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                icon={Clock}
                type="datetime-local"
                inital={
                  selectedEvent
                    ? formatDateTimeForInput(selectedEvent.start)
                    : ""
                }
                value={startDate ? formatDateTimeForInput(startDate) : ""}
                required
                onChange={handleDateChange}
              />
              <Input
                icon={PenTool}
                type="text"
                placeholder="Description"
                value={description}
                required
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                icon={Users}
                type="number"
                placeholder="Group Average Age"
                value={groupAvgAge}
                required
                onChange={(e) => setGroupAvgAge(e.target.value)}
              />
              <Input
                icon={Users}
                type="number"
                placeholder="Max Group Size"
                value={maxGroupSize}
                required
                onChange={(e) => setMaxGroupSize(e.target.value)}
              />
              <Input
                icon={Clock}
                type="number"
                placeholder="Duration in mins"
                value={duration}
                required
                onChange={(e) => setDuration(e.target.value)}
              />
              <Select
                icon={Globe}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={[
                  { value: "English", label: "English" },
                  { value: "Spanish", label: "Spanish" },
                  { value: "French", label: "French" },
                  { value: "German", label: "German" },
                  { value: "Italian", label: "Italian" },
                ]}
              />
              {error && (
                <p className="text-red-500 text-center text-sm">{error}</p>
              )}
              <motion.button
                className=" w-fit-content py-3 px-8 bg-gradient-to-r from-sky-500 to-sky-800 
            font-bold rounded-lg shadow-lg hover:from-sky-600
            hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
             focus:ring-offset-gray-900 transition duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className=" animate-spin mx-auto" size={24} />
                ) : (
                  "Add"
                )}
              </motion.button>
            </form>
          </Modal>
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Are you sure you want to permanently delete it?"
            className="text-red"
          >
            {error && (
              <p className="text-red-500 text-center text-sm">{error}</p>
            )}
            <motion.button
              className=" w-fit-content py-3 px-8 bg-gradient-to-r from-red-500 to-red-800 
            font-bold rounded-lg shadow-lg hover:from-red-600
            hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
             focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleTourDeleteSubmit}
            >
              Delete
            </motion.button>
          </Modal>
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
            eventDragStart={handleEventDragStart}
            datesSet={handleDatesSet}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            height="800px"
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ToursPage;
