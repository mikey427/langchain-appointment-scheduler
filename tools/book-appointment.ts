import { writeScheduleJSON } from "../utils.ts";
import { readAuthFile } from "../google/auth.ts";
import { Temporal } from "@js-temporal/polyfill";
import { createAppt } from "../google/calendar.ts";

export async function book_appointment(
  scheduleData: any,
  date: string, // 1-31
  month: string, // 1-12
  startTime: string,
  apptType: string,
  name: string,
  email: string,
  phone: string,
  notes: string
) {
  // const newData = scheduleData;
  const auth = await readAuthFile();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "";
  // newData.appointments.push({
  //   id: scheduleData.appointments.length + 1,
  //   day,
  //   start_time: startTime,
  //   duration: scheduleData.appointment_type_durations[apptType],
  //   attendee_name: name,
  //   attendee_email: email,
  //   attendee_phone: phone,
  //   appointment_type: apptType,
  //   notes,
  // });

  try {
    // writeScheduleJSON(newData);
    // const currentYear = Temporal.Now.plainDateISO().year;
    const currentYear = 2026;
    const [hours, minutes]: number[] = startTime.split(":").map(Number);
    console.log("Parsed time:", { hours, minutes });
    console.log("Inputs:", {
      date,
      month,
      startTime,
      parsedMonth: Number(month),
      parsedDate: Number(date),
    });
    const startDatetime = Temporal.ZonedDateTime.from({
      year: currentYear,
      month: Number(month),
      day: Number(date),
      hour: hours,
      minute: minutes,
      timeZone: "America/Los_Angeles",
    });
    const apptDuration = scheduleData.appointment_type_durations[apptType];
    const endDateTime = startDatetime.add({ minutes: apptDuration });
    const result = await createAppt(
      auth.access_token,
      calendarId,
      startDatetime.toString(),
      endDateTime.toString()
    );
    return { success: true, result: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      reason: "Failed to create appointment.",
    };
  }

  return {
    success: true,
  };
}
