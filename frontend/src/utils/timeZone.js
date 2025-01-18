import moment from "moment-timezone";

export const combineDateTimeToUTC = (startDate, startTime) => {
    // Combine date and time strings
    const dateTimeString = `${startDate} ${startTime}`;
    
    // Parse the combined string in Cairo timezone
    const cairoDateTime = moment.tz(dateTimeString, "YYYY-MM-DD HH:mm", "Africa/Cairo");
    
    // Convert to UTC
    const utcDateTime = cairoDateTime.utc();
    
    // Return ISO string for database storage
    return utcDateTime.toISOString();
  };