import fs from "fs/promises";
import crypto from "crypto";
import { write } from "fs";

let OAuthStateToken = "";

interface CalendlyAuthData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
  owner: string;
  organization: string;
}

export async function readTokenFromFile() {
  const tokenFilePath = "./tokens.json";

  let calendlyTokenDataString;
  calendlyTokenDataString = await fs.readFile(tokenFilePath, "utf8");

  let calendlyTokenData = JSON.parse(calendlyTokenDataString);

  if (Object.keys(calendlyTokenData).length === 0) {
    console.log("NEED TO REINIT AUTH");
  }

  // console.log(calendlyTokenData);

  return calendlyTokenData;
}

export async function writeTokenToFile(calendlyOAuthData: CalendlyAuthData) {
  const tokenFilePath = "./tokens.json";
  const date = new Date(calendlyOAuthData.created_at * 1000);
  const expiresAt = new Date(
    (calendlyOAuthData.created_at + calendlyOAuthData.expires_in) * 1000
  );

  const stringifiedJSON = JSON.stringify(calendlyOAuthData, null, 2);

  try {
    await fs.writeFile(tokenFilePath, stringifiedJSON);
    console.log("Calendly auth data successfully written to file");
  } catch (err) {
    console.error("Error writing to file: ", err);
  }
}

export function buildCalendlyOAuthUrl(OAuthStateToken: string) {
  const baseOAuthUrl = "https://auth.calendly.com/oauth/authorize";
  const calendlyClientId = process.env.CALENDLY_CLIENT_ID || "";
  const calendlyClientSecret = process.env.CALENDLY_CLIENT_SECRET || "";

  if (calendlyClientId == "" || calendlyClientSecret == "") {
    console.error("Missing Calendly Auth Env Variables");
  }

  const url = new URL(baseOAuthUrl);
  url.searchParams.append("client_id", calendlyClientId);
  url.searchParams.append("response_type", "code");
  url.searchParams.append(
    "redirect_uri",
    "http://localhost:3000/auth/calendly"
  );
  url.searchParams.append("state", OAuthStateToken);
  console.log("OAUTHSTATETOKEN IN FUCNTION: ", OAuthStateToken);

  return url.toString();
}

export function generateOAuthStateToken() {
  OAuthStateToken = crypto.randomBytes(32).toString("hex");

  return OAuthStateToken;
}

export async function retrieveAuthToken(code: string) {
  const clientId = process.env.CALENDLY_CLIENT_ID;
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const res = await fetch("https://auth.calendly.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:3000/auth/calendly",
    }),
  });

  const calendlyTokenData = await res.json();
  return calendlyTokenData;
}

export async function refreshAuthToken(refreshToken: string) {
  const clientId = process.env.CALENDLY_CLIENT_ID;
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const res = await fetch("https://auth.calendly.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const calendlyTokenData = await res.json();
  return calendlyTokenData;
}

export async function getOrRefreshCalendlyAccessToken() {
  let calendlyAuthData = await readTokenFromFile();

  const isExpired = isTokenExpired(
    calendlyAuthData.created_at,
    calendlyAuthData.expires_in
  );

  if (isExpired) {
    const refreshedTokenData = await refreshAuthToken(
      calendlyAuthData.refresh_token
    );
    await writeTokenToFile(refreshedTokenData);
    calendlyAuthData = refreshedTokenData;
  }

  return calendlyAuthData.access_token;
}

export function isTokenExpired(created_at: number, expires_in: number) {
  const expirationDate = new Date((created_at + expires_in) * 1000);

  const isExpired = expirationDate < new Date();

  return isExpired;
}
