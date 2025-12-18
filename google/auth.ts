import crypto from "crypto";
import fs from "fs";
import { initializeTempServer } from "./server.ts";

const googleAuthClientID = process.env.GOOGLE_CLIENT_ID || "";
const googleAuthSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const googleRedirectURL =
  process.env.GOOGLE_REDIRECT_URL || "localhost:3000/auth/google";

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
  url.searchParams.append("scope", "https://www.googleapis.com/auth/calendar");

  return url;
}

export async function authenticateGoogle() {
  const state = crypto.randomBytes(32).toString("hex");
  // Build Auth URL
  const url = buildGoogleAuthUrl(state);
  // Create temp server
  const server = initializeTempServer(state);
  // Display Auth URL
  console.log(
    `
	Click the link below and log in.

	${url}
	`
  );

  //   const response = await fetch("url", { method: "POST",
  //    });
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

export async function getOrRefreshGoogleAccessToken(tokenData: any) {
  // Get created at time
  // Get expiration
  // Calculate ifExpired
  // If not, return
  // If yes, refresh token with
}
