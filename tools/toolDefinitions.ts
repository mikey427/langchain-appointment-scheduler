const toolsArray = [
  {
    type: "function",
    name: "get_current_datetime",
    description: "Get the current date and time. Use this to determine what day it is today and the current time.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    type: "function",
    name: "get_availability",
    description: "Get available appointment slots for a specific date range. Returns a list of available time slots that can be booked.",
    parameters: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "The start date to check availability in ISO 8601 format (YYYY-MM-DD)",
        },
        end_date: {
          type: "string",
          description: "The end date to check availability in ISO 8601 format (YYYY-MM-DD)",
        },
      },
      required: ["start_date", "end_date"],
    },
  },
  {
    type: "function",
    name: "book_appointment",
    description: "Book an appointment at a specific date and time. This creates a confirmed appointment in the calendar.",
    parameters: {
      type: "object",
      properties: {
        start_time: {
          type: "string",
          description: "The start time of the appointment in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)",
        },
        end_time: {
          type: "string",
          description: "The end time of the appointment in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)",
        },
        name: {
          type: "string",
          description: "The name of the person booking the appointment",
        },
        email: {
          type: "string",
          description: "The email address of the person booking the appointment",
        },
        notes: {
          type: "string",
          description: "Optional notes or details about the appointment",
        },
      },
      required: ["start_time", "end_time", "name", "email"],
    },
  },
  {
    type: "function",
    name: "send_confirmation",
    description: "Send a confirmation message about the appointment to the caller. Use this after an appointment has been successfully booked.",
    parameters: {
      type: "object",
      properties: {
        appointment_id: {
          type: "string",
          description: "The unique identifier of the appointment to confirm",
        },
        email: {
          type: "string",
          description: "The email address to send the confirmation to",
        },
      },
      required: ["appointment_id", "email"],
    },
  },
  {
    type: "function",
    name: "get_caller_info",
    description: "Get information about the current caller from the conversation context or stored data. Returns caller details like name, email, phone number if available.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

export default toolsArray;
