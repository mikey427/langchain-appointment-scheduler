import { start } from "node:repl";

export async function retrieveCalendarEvents(
  accessToken: string,
  calendarId: string
) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  console.log("Data: ", data);
  //   return data;
}

export async function retrieveCalendarId(accessToken: string) {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  console.log(data);
}

export async function createAppt(
  accessToken: string,
  calendarId: string,
  startDatetime: Date,
  endDateTime: Date
) {
  // TODO: Start and End datetime validation / Error handling
  console.log("starttime: ", startDatetime.toISOString());
  console.log("endtime: ", endDateTime.toISOString());

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: "Appointment",
        start: {
          dateTime: startDatetime.toISOString(),
        },
        end: {
          dateTime: endDateTime.toISOString(),
        },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Calendar API Error:", JSON.stringify(data, null, 2));
  }

  console.log(data);
  return data;
}
