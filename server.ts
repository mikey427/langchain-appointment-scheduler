import type { Request, Response } from "express";
import express from "express";
import { retrieveAuthToken } from "./google/auth.ts";
import { writeTokenToFile } from "./google/auth.ts";

export async function initializeTempServer(OAuthStateToken: string) {
  const app = express();
  const port = 3000;

  app.get("/", (req: Request, res: Response) => {
    console.log("hit");
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Server Status</title>
</head>
<body>
    <h1>Server is Working!</h1>
    <p>The endpoint is functioning correctly.</p>
</body>
</html>`);
  });
  app.get("/auth/calendly", async (req: Request, res: Response) => {
    const state = req.query.state as string;
    const code = req.query.code as string;

    if (!state || !code) {
      return res.status(400).send("Missing state or code");
    }
    console.log("state: ", state);
    console.log("OAuthStateToken", OAuthStateToken);
    console.log(state, "== ", OAuthStateToken);
    if (state !== OAuthStateToken) {
      console.log("Incorrect OAuthStateToken");

      return res.status(403).send("Invalid state token");
    }

    // Request to calendly with Token
    const calendlyAuthData = await retrieveAuthToken(code);

    console.log(calendlyAuthData);
    await writeTokenToFile(calendlyAuthData);

    res
      .status(200)
      .send("Authentication successful! You can close this window.");
  });

  const server = app.listen(3000, () => {
    // console.log("Server running on port 3000");
  });

  return server;
}
