import { Temporal } from "@js-temporal/polyfill";

export async function retrieveCalendarEvents(
	accessToken: string,
	calendarId: string,
	rawStartDate: string,
	rawEndDate: string,
) {
	// Convert YYYY-MM-DD dates to start/end of day in local time zone
	const timeZone = "America/Los_Angeles";
	const startDate = Temporal.PlainDate.from(rawStartDate)
		.toZonedDateTime({ timeZone, plainTime: "00:00:00" })
		.toInstant()
		.toString();
	const endDate = Temporal.PlainDate.from(rawEndDate)
		.toZonedDateTime({ timeZone, plainTime: "23:59:59" })
		.toInstant()
		.toString();

	// Pass temporal dates into timeMax and timeMin url params
	const rawfetchEventsUrl: URL = new URL(
		`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
	);
	const params = rawfetchEventsUrl.searchParams;

	params.append("timeMax", endDate);
	params.append("timeMin", startDate);

	const fetchEventsUrl = rawfetchEventsUrl.toString();
	const res = await fetch(fetchEventsUrl, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data = await res.json();

	if (!res.ok) {
		console.error("Calendar API Error:", JSON.stringify(data, null, 2));
	}
	console.log("fetched data: ", data);

	return data;
}

export async function retrieveCalendarId(accessToken: string) {
	const res = await fetch(
		"https://www.googleapis.com/calendar/v3/users/me/calendarList",
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	);

	const data = await res.json();

	console.log(data);
}

export async function createAppt(
	accessToken: string,
	calendarId: string,
	startDatetime: string,
	endDateTime: string,
	apptData: any,
) {
	// TODO: Start and End datetime validation / Error handling
	// console.log("starttime: ", startDatetime.toISOString());
	// console.log("endtime: ", endDateTime.toISOString());
	console.log(accessToken);
	const requestBody = {
		summary: `
    -- Appointment --
    Name: ${apptData.name}
    Appt Type: ${apptData.apptType}
    Email: ${apptData.email}
    Phone: ${apptData.phone}
    Notes: ${apptData.notes}
    `,
		start: {
			dateTime: startDatetime,
			timeZone: "America/Los_Angeles",
		},
		end: {
			dateTime: endDateTime,
			timeZone: "America/Los_Angeles",
		},
		attendees: [apptData.email],
	};
	console.log(requestBody);
	const res = await fetch(
		`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		},
	);

	const data = await res.json();

	if (!res.ok) {
		console.error("Calendar API Error:", JSON.stringify(data, null, 2));
	}

	console.log(data);
	return data;
}
