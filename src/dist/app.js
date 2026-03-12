"use strict";
async function initializeCall() {
    // console.log("Running init Call in frontend")
    const initReq = await fetch("/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await initReq.json();
    console.log("initReq: ", initReq);
    console.log("data: ", data);
    return {
        id: data.id
    };
}
let session;
(async () => {
    session = await initializeCall();
})();
document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".submit-button");
    const input = document.querySelector(".chat-input");
    console.log("button", button);
    button?.addEventListener("click", async () => {
        if (!input)
            return;
        const message = input.value;
        // Fetch POST /chat with messages
        console.log("message: ", message);
        console.log("session: ", session);
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
    });
});
function refreshChatWindow() {
    console.log("refreshing");
    const container = document.querySelector(".messages");
    container.innerHTML = "";
    console.log("session: ", session);
    if (!session.conversation)
        return;
    session.conversation.forEach((turn, index) => {
        if (index === 0)
            return;
        const li = document.createElement("li");
        if (turn.role === 'assistant') {
            li.classList.add("message", "message-assistant");
        }
        else {
            li.classList.add("message", "message-user");
        }
        li.textContent = turn.content;
        container?.appendChild(li);
        console.log("Chat added.");
    });
}
// export {}
//# sourceMappingURL=app.js.map