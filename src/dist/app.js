"use strict";
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
        const res = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message,
            }),
        });
        console.log("res", res);
    });
});
//# sourceMappingURL=app.js.map