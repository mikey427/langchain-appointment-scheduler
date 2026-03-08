"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".submit-button");
    const input = document.querySelector(".chat-input");
    console.log("button", button);
    button?.addEventListener("click", () => {
        if (!input)
            return;
        const message = input.value;
        // Fetch POST /chat with messages
        console.log("message: ", message);
    });
});
//# sourceMappingURL=app.js.map