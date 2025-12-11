import { writeScheduleJSON } from "../utils.ts";

export function book_appointment(
  scheduleData: any,
  day: string,
  startTime: string,
  apptType: string,
  name: string,
  email: string,
  phone: string,
  notes: string
) {
  const newData = scheduleData;

  newData.appointments.push({
    id: scheduleData.appointments.length + 1,
    day,
    start_time: startTime,
    duration: scheduleData.appointment_type_durations[apptType],
    attendee_name: name,
    attendee_email: email,
    attendee_phone: phone,
    appointment_type: apptType,
    notes,
  });

  try {
    writeScheduleJSON(newData);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      reason: "JSON Write failed.",
    };
  }

  return {
    success: true,
  };
}
