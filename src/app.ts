interface Session {
	id: string;
	instructions: string;
	tools: any;
	schema: any;
	conversation: any;
}

async function initializeCall() {
	// console.log("Running init Call in frontend")
	const initReq = await fetch("/init", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});

	const data = await initReq.json();

	console.log("initReq: ", initReq);
	console.log("data: ", data);
	return {
		id: data.id,
	};
}

async function sendInput(input: HTMLInputElement) {
	console.log("inputDisabled: ", inputDisabled)
	if (!input) return;
	if (inputDisabled) return;
	inputDisabled = true;
	const message = input.value;
	input.value = "";

	session.conversation.push({
		role: "user",
		content: message,
	});
	refreshChatWindow();
	

	// Fetch POST /chat with messages
	// console.log("message: ", message);
	// console.log("session: ", session);
	const res = await fetch("/chat", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			id: String(session.id),
			message,
		}),
	});

	const data = await res.json();

	console.log("data: ", data);

	if (res.ok) {
		session = data.data;
		refreshChatWindow();
	}

	input.focus();
	inputDisabled = false;
}

async function attachEventListeners() {
	inputDisabled = true;
	const submitButton = document.querySelector(
		".submit-button",
	) as HTMLButtonElement;
	const input = document.querySelector(".chat-input") as HTMLInputElement;
	const resetButton = document.querySelector(".reset-button") as HTMLButtonElement;
	console.log("button", submitButton);

	submitButton?.addEventListener("click", () => {
		sendInput(input);
	});

	input.addEventListener("keypress", (event) => {
		if (event.key === "Enter") sendInput(input);
	});

	resetButton.addEventListener("click", async () => {
		const res = await initializeCall();
		session = buildSession(res.id)
		refreshChatWindow();
	})

	inputDisabled = false;
}

let session: Session;
let inputDisabled: Boolean;
(async () => {
	const res = await initializeCall();
	session = buildSession(res.id);
	attachEventListeners();
})();

function buildSession(id: string) {
	return {
		id: id,
		instructions: "",
		tools: [],
		schema: {},
		conversation: [
			{
				role: "assistant",
				content:
					"Hi! I'm your scheduling assistant. What can I help you book today?",
			},
		],
	}
}

function refreshChatWindow() {
	console.log("refreshing");
	const container = document.querySelector(".messages");
	(container as HTMLElement).innerHTML = "";

	console.log("session: ", session);
	if (!session.conversation) return;
	session.conversation.forEach(
		(
			turn: {
				role: string;
				content: string;
				tool_call_id?: string;
				name?: string;
			},
			index: number,
		) => {
			console.log("turn: ", turn);
			// if (index === 0) return;
			if (turn.role === "system") return;
			const li = document.createElement("li");
			if (turn.role === "assistant") {
				li.classList.add("message", "message-assistant");
			} else if (turn.role === "user") {
				li.classList.add("message", "message-user");
			} else if (turn.role === "tool") {
				if (
					turn?.name == "book_appointment" &&
					index == session?.conversation.length - 2
				) {
					console.log("appointment booked in if");
					refreshCalendar();
				}
				return;
			} else {
				return;
			}

			if (typeof turn.content !== "string") return;

			li.textContent = turn.content;
			container?.appendChild(li);
			console.log("Chat added.");
		},
	);
}

function refreshCalendar() {
	const calendar = document.querySelector(".calendar") as HTMLIFrameElement;
	console.log("calendar: ", calendar);
	if (!calendar) return;
	calendar.src = calendar?.src;
}

// export {}
