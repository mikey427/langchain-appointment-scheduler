import { tool } from "@langchain/core/tools";
import { get_availability } from "./get-availability.ts";
import { readScheduleJSON } from "../utils.ts";
import { get_current_datetime } from "./get-current-datetime.ts";
import { book_appointment } from "./book-appointment.ts";
const getAvailabilityTool = tool(
  async ({ appointment_type }) => {
    const scheduleData = await readScheduleJSON();
    const result = get_availability(scheduleData, appointment_type);
    return JSON.stringify(result);
  },
  {
    name: "get_availability",
    description:
      "Get available appointment slots for a specific appointment type. Returns a list of available time slots that can be booked.",
    schema: {
      type: "object",
      properties: {
        appointment_type: {
          type: "string",
          description:
            "Type of appointment (consultation, follow-up, procedure)",
        },
      },
      required: ["appointment_type"],
    },
  }
);

const getCurrentDatetimeTool = tool(
  async () => {
    const result = get_current_datetime();
    return JSON.stringify(result);
  },
  {
    name: "get_current_datetime",
    description:
      "Get the current date and time. Use this to determine what day it is today and the current time.",
    schema: {
      type: "object",
      properties: {},
      required: [],
    },
  }
);

const bookAppointmentTool = tool(
  async ({ day, start_time, appointment_type, name, email, phone, notes }) => {
    const scheduleData = await readScheduleJSON();
    const result = book_appointment(
      scheduleData,
      day,
      start_time,
      appointment_type,
      name,
      email,
      phone,
      notes
    );
    return JSON.stringify(result);
  },
  {
    name: "book_appointment",
    description:
      "Book an appointment at a specific date and time. This creates a confirmed appointment in the calendar.",
    schema: {
      type: "object",
      properties: {
        day: {
          type: "string",
          description:
            "The day of the week for the appointment (e.g., Monday, Tuesday)",
        },
        start_time: {
          type: "string",
          description:
            "The start time of the appointment in HH:mm format (e.g., 8:30, 14:00)",
        },
        appointment_type: {
          type: "string",
          description:
            "Type of appointment (consultation, follow-up, procedure)",
        },
        name: {
          type: "string",
          description: "The name of the person booking the appointment",
        },
        email: {
          type: "string",
          description:
            "The email address of the person booking the appointment",
        },
        phone: {
          type: "string",
          description: "The phone number of the person booking the appointment",
        },
        notes: {
          type: "string",
          description: "Optional notes or details about the appointment",
        },
      },
      required: [
        "day",
        "start_time",
        "appointment_type",
        "name",
        "email",
        "phone",
      ],
    },
  }
);

export const tools = [
  getAvailabilityTool,
  getCurrentDatetimeTool,
  bookAppointmentTool,
];
