import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import tourStore from "../store/tourStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
i;

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <FullCalendar
      height="70vh"
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
      }}
      initialView="dayGridMonth"
      editable={true}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      select={handleDateSelect}
      eventClick={handleEventClick}
      eventsSet={(events) => {
        setCurrentEvent(events);
      }}
    />
  );
};

export default Calendar;
