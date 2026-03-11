async function initializeCall() {
    console.log("Running init Call in frontend")
    const initReq = await fetch("/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })

    console.log("initReq: ", initReq)
}

(async () => {
    await initializeCall();
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

// export {}