import express from "express";
import { retrieveAuthToken, writeToAuthFile } from "./auth.ts";

export function initializeTempServer(state: string): Promise<void> {
	const app = express();
	const port = 3000;

	return new Promise((resolve, reject) => {
		app.get("/auth/google", async (req, res) => {
			const code = req.query.code as string;
			const error = req.query.error as string;
			const returnedState = req.query.state as string;

			if (error) {
				res.status(400).send(`Error: ${error}`);
				return reject(new Error(error));
			}

			if (returnedState !== state) {
				res.status(400).send("State mismatch: possible CSRF attack");
				return reject(new Error("State mismatch"));
			}

			try {
				let tokens = await retrieveAuthToken(code);

				console.log("Tokens received:", tokens);
				await writeToAuthFile({
					createdAt: new Date().toISOString(),
					...tokens,
				});
				res.status(200).send("Authentication successful!");
				server.close();
				resolve();
			} catch (error) {
				console.log("Error: ", error);
				res.status(500).send("Token exchange failed");
				server.close();
				reject(error);
			}
		});

		const server = app.listen(port, () => {
			console.log(`Waiting for Google OAuth callback on port ${port}`);
		});
	});
}
