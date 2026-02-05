/**
 * Gets available appointment slots based on schedule data and filters.
 *
 * @param {any} scheduleData - Schedule configuration containing availability windows, appointments, and appointment types
 * @param {string} startDate - Start date filter for availability search (currently unused)
 * @param {string} endDate - End date filter for availability search (currently unused)
 * @param {string} appointmentType - Type of appointment to search availability for (e.g., "consultation", "procedure")
 *
 * @returns {Object} Result object containing success status and availability data
 * @returns {boolean} returns.success - Whether the operation succeeded
 * @returns {Object} returns.availability - Object with day names as keys and arrays of available time slots as values
 * @returns {string} returns.reason - Error reason if success is false
 *
 * @example
 * const result = get_availability(scheduleData, "", "", "consultation");
 * // Returns: { success: true, availability: { monday: ["08:00", "08:15", ...], ... } }
 */
// This function returns availability that's able to fill the entire apptType window
// TODO: Implement date range when I implement an actual calendar
// export function get_availability(
//   scheduleData: any,
//   // startDate: string,
//   // endDate: string,
//   appointmentType: string
// ) {
//   // Step 1: Pull in available time slots based on start/end date
//   const appointmentDuration =
//     scheduleData.appointment_type_durations[appointmentType];

import { getOrRefreshGoogleAccessToken } from "../google/auth.ts";
import { retrieveCalendarEvents } from "../google/calendar.ts";
import { appointmentTypeDurations } from "../index.ts";

//   if (appointmentDuration === undefined) {
//     console.log("get_availability error - no appointmentDuration");
//     return {
//       success: false,
//       reason: "No appointment duration",
//     };
//   }
//   const appointments = scheduleData.appointments;
//   const days = Object.keys(scheduleData?.availability);

//   // Step 2: Fill in available time slots into data structure
//   let availability: { [key: string]: string[] | null } = {};
//   days.forEach((day: any) => {
//     if (day == null) {
//       availability[day] = null;
//       return null;
//     } else {
//       // Break day (based on hours down to time slots

//       // Pull in day Schedule
//       const daySchedule = scheduleData.availability[day];
//       if (daySchedule == null) {
//         availability[day] = null;
//         return null;
//       }
//       // START TIME
//       const dayStart = daySchedule.start;
//       // Convert to number for easier comparison
//       const startMinFromMidnight = timeToMinutesFromMidnight(dayStart);
//       // END TIME
//       const dayEnd = daySchedule.end;
//       // Convert to mumber for easier comparision
//       const endMinFromMidnight = timeToMinutesFromMidnight(dayEnd);
//       let slots = [];
//       let dayMins = startMinFromMidnight;

//       while (dayMins < endMinFromMidnight) {
//         slots.push(dayMins);
//         dayMins += 15;
//       }
//       slots = slots.map((mins: number) => {
//         const hours = Math.floor(mins / 60);
//         const minutes = mins % 60;
//         return `${hours.toString().padStart(2, "0")}:${minutes
//           .toString()
//           .padStart(2, "0")}`;
//       });

//       availability[day] = slots;
//     }
//   });

//   // Step 3: Filter gaps from available timeslots (filter)
//   console.log("pre:", availability);
//   // Example of structure:
//   // {
//   // sunday: null,
//   // monday: [
//   //   '08:00', '09:00',
//   //   '10:00', '11:00',
//   //   '12:00', '13:00',
//   //   '14:00', '15:00',
//   //   '16:00'
//   // ]}

//   // Convert appointments to captured hours
//   Object.keys(availability).forEach((dayName) => {
//     const slots = availability[dayName];
//     if (slots === null) return;

//     availability[dayName] = slots.filter((slot: string) => {
//       let slotFilled = false;
//       const slotMinutes = timeToMinutesFromMidnight(slot);
//       const slotEndMinutes = slotMinutes + appointmentDuration;
//       appointments.forEach((appt: any) => {
//         const aptStartMinutes = timeToMinutesFromMidnight(appt.start_time);
//         const aptEndMinutes = aptStartMinutes + appt.duration;
//         if (
//           dayName.toLowerCase() === appt.day.toLowerCase() &&
//           slotMinutes < aptEndMinutes &&
//           slotEndMinutes > aptStartMinutes
//         ) {
//           slotFilled = true;
//         }
//       });
//       return !slotFilled;
//     });
//   });

//   // Step 4: Return availability
//   console.log("new: ", availability);
//   return {
//     success: true,
//     availability,
//   };
// }

// What data do I start with?
// Inputs: available scheduling hours, start / end date filters, appointment type (for timeslot duration)

// What data do I need to end with?
// Output: {monday: [slots], tuesday: [slots], ...}

// What are the transformationg steps between them?
// Order:
// 1. Convert to minutes from midnight
// 2. Calculate slots and populate
// 3. Filter through every array in object (using keys) to remove scheduled timeslots
// 4. Return available time slots

// What are the tricky parts?
// - Need to convert start / end times to numbers for easier comparison
// - Need to convert appointments datetime the same way to compare

export async function get_availability(
	scheduleData: any,
	appointmentType: string,
	startDate: string,
	endDate: string,
) {
	// Fetch availability from google api (filtered via params)
	const auth = await getOrRefreshGoogleAccessToken();
	const calendarId = process.env.GOOGLE_CALENDAR_ID || "";
	const availability = await retrieveCalendarEvents(
		auth.access_token,
		calendarId,
		startDate,
		endDate,
	);
	// Transform calendar events into a simple format for the LLM
	const bookedSlots = availability.items.map((event: any) => ({
		start: event.start.dateTime,
		end: event.end.dateTime,
	}));

	return {
		startDate,
		endDate,
		bookedSlots,
	};
}

function timeToMinutesFromMidnight(time: string) {
	const [hours, mins] = time.split(":").map(Number);
	// Convert to number for easier comparison
	return hours * 60 + mins;
}
