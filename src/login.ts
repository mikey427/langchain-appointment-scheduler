(async () => {
	attachLoginEventListener();
})();

function attachLoginEventListener() {
	const button = document.querySelector(".submit-button");
	const input = document.querySelector(".password-input") as HTMLInputElement;

	button?.addEventListener("click", async (event) => {
		await login();
		console.log("click")
	});
	input?.addEventListener("keypress", async (event) => {
		if(event.key === 'Enter') await login();
	})
	console.log("event listeners attached");
}

async function login() {
	const input = document.querySelector(".password-input") as HTMLInputElement;

	const password = input?.value;

	const res = await fetch("/verify", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ password }),
	});

	if (res.ok) {
		window.location.href = "/";
	} else {
		alert("Incorrect password");
	}
}


