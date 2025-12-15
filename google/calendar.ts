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

export async function createAppt(accessToken: string, calendarId: string) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
	  body: {
		start:
	  }
    }

	// Left off here, OAuth functionality built. Building google calendar functions then need to wire it all into workflow
  );

  const data = await res.json();

  console.log(data);
}
