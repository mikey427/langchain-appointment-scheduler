

interface Session {
    id: string,
    instructions: string,
    tools: any,
    schema: any,
    conversation: any
}

async function initializeCall() {
    // console.log("Running init Call in frontend")
    const initReq = await fetch("/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })

    const data = await initReq.json();

    console.log("initReq: ", initReq)
    console.log("data: ", data)
    return {
        id: data.id
    }
}
let session: Session;
(async () => {
    const res = await initializeCall();
    session = {
        id: res.id,
        instructions: "",
        tools: [],
        schema: {},
        conversation: []
    }

})();


document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(
        ".submit-button",
    ) as HTMLButtonElement;
    const input = document.querySelector(".chat-input") as HTMLInputElement;

    console.log("button", button);

    button?.addEventListener("click", async () => {
        if (!input) return;
        const message = input.value;
        input.value = "";
        // Fetch POST /chat with messages

        console.log("message: ", message);
        console.log("session: ", session)
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

        console.log("data: ", data)

        if(res.ok) {
            session = data.data;
            refreshChatWindow()
        }

        input.focus();
    });
});

function refreshChatWindow() {
    console.log("refreshing")
    const container = document.querySelector(".messages");
    (container as HTMLElement).innerHTML = "";

    console.log("session: ", session)
    if (!session.conversation) return;
    session.conversation.forEach((turn: {
        role: string, content: string, tool_call_id?: string, name?: string
    }, index:number) => {
        console.log("turn: ", turn)
        if(index === 0) return;
        const li = document.createElement("li");
        if(turn.role === 'assistant') {
            li.classList.add("message", "message-assistant")
        } else if (turn.role === 'user'){
            li.classList.add("message", "message-user")
        } else if (turn.role === 'tool') {
            if(turn?.name == "book_appointment" && index == session?.conversation.length - 2) {
                console.log("appointment booked in if")
                refreshCalendar();
            }
            return
        } else{
            return
        }

        if(typeof turn.content !== 'string') return;
        
        li.textContent = turn.content
        container?.appendChild(li)
        console.log("Chat added.")
    })
}

function refreshCalendar() {
    const calendar = document.querySelector('.calendar') as HTMLIFrameElement
    console.log("calendar: ", calendar)
    if(!calendar) return;
    calendar.src = calendar?.src
}

// export {}