import express from "express";
import { retrieveAuthToken, writeToAuthFile } from "./auth.ts";

export async function initializeTempServer(state: string) {
  const app = express();
  const port = 3000;

  app.get("/auth/google", async (req, res) => {
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error) {
      return res.status(400).send(`Error: ${error}`);
    }

    try {
      let tokens = await retrieveAuthToken(code);

      console.log("Tokens received:", tokens);
      writeToAuthFile({ createdAt: new Date().toISOString(), ...tokens });
      res.status(200).send("Authentication successful!");
    } catch (error) {
      console.log("Error: ", error);
      res.status(500).send("Token exchange failed");
    }
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
