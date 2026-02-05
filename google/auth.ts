import crypto from "crypto";
import fs from "fs";
import { initializeTempServer } from "./server.ts";
import { Temporal } from "@js-temporal/polyfill";

const googleAuthClientID = process.env.GOOGLE_CLIENT_ID || "";
const googleAuthSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const googleRedirectURL =
	process.env.GOOGLE_REDIRECT_URL || "http://localhost:3000/auth/google";

function buildGoogleAuthUrl(state: string) {
	if (!googleAuthClientID || !googleAuthSecret) {
		console.log("Google credentials missing");
	}

	const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
	url.searchParams.append("client_id", googleAuthClientID);
	url.searchParams.append("redirect_uri", googleRedirectURL);
	url.searchParams.append("response_type", "code");
	url.searchParams.append("access_type", "offline");
	url.searchParams.append("prompt", "consent");
	url.searchParams.append("state", state);
	url.searchParams.append(
		"scope",
		"https://www.googleapis.com/auth/calendar",
	);

	return url;
}

export async function authenticateGoogle() {
	const state = crypto.randomBytes(32).toString("hex");
	// Build Auth URL
	const url = buildGoogleAuthUrl(state);
	// Display Auth URL
	console.log(
		`
	Click the link below and log in.

	${url}
	`,
	);
	// Start temp server and wait for the OAuth callback to complete
	await initializeTempServer(state);
}

export async function retrieveAuthToken(code: string) {
	const tokenUrl = "https://oauth2.googleapis.com/token";

	const params = new URLSearchParams({
		code: code,
		client_id: googleAuthClientID,
		client_secret: googleAuthSecret,
		redirect_uri: googleRedirectURL,
		grant_type: "authorization_code",
	});

	const response = await fetch(tokenUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Token exchange failed: ${error}`);
	}

	const tokens = await response.json();

	return tokens;
}

export async function writeToAuthFile(tokenData: any): Promise<void> {
	const dataStr = JSON.stringify(tokenData, null, 2);
	await fs.promises.writeFile("tokens.json", dataStr, "utf8");
}

export async function readAuthFile() {
	const dataStr = await fs.promises.readFile("tokens.json", "utf8");
	return JSON.parse(dataStr);
}

async function refreshGoogleAccessToken(auth: AuthObject) {
	try {
		console.log("authObj", auth);
		if (isExpired(auth.createdAt, Number(auth.refresh_token_expires_in))) {
			throw new Error("Expired Google Refresh Token. Reinitialize OAuth");
		}
		const params = new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: auth.refresh_token,
			client_id: googleAuthClientID,
			client_secret: googleAuthSecret,
		});
		const res = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			body: params.toString(),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		if (!res.ok) {
			const error = await res.text();
			throw new Error(`Token refresh failed: ${error}`);
		}

		const token = await res.json();
		return token;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getOrRefreshGoogleAccessToken() {
	try {
		const auth = await readAuthFile();
		console.log("auth read from file", auth);
		if (isExpired(auth.createdAt, auth.expires_in)) {
			const refreshedTokens = await refreshGoogleAccessToken(auth);
			const updatedAuth = {
				...auth,
				...refreshedTokens,
				createdAt: new Date().toISOString(),
			};
			console.log("refreshedAuth", updatedAuth);
			await writeToAuthFile(updatedAuth);
			return updatedAuth;
		} else {
			return auth;
		}
	} catch (error) {
		return error;
	}
}

function isExpired(createdAtStr: string, expiresInSecondsStr: number): boolean {
	const createdAt = Temporal.Instant.from(createdAtStr);
	const expiresIn = Temporal.Duration.from({ seconds: expiresInSecondsStr });
	const expirationDateTime = createdAt.add(expiresIn);
	return (
		Temporal.Instant.compare(expirationDateTime, Temporal.Now.instant()) < 0
	);
}

interface AuthObject {
	createdAt: string;
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: string;
	refresh_token_expires_in: string;
}
