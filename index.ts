#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFile } from "fs/promises";
import { join } from "path";
import { AIMessage } from "langchain";
import {
  buildCalendlyOAuthUrl,
  generateOAuthStateToken,
  getOrRefreshCalendlyAccessToken,
  isTokenExpired,
  readTokenFromFile,
  refreshAuthToken,
} from "./google/auth.ts";
import { initializeTempServer } from "./server.ts";
import { readScheduleJSON } from "./utils.ts";
import { get_availability } from "./tools/get-availability.ts";

let scheduleData;

program
  .version("1.0.0")
  .description("Langchain Appointment Scheduler")
  .option("-c, --connect_oauth")
  .option("-r, --refresh_token")
  .option("-t, --tool")
  .action(async (options) => {
    scheduleData = await readScheduleJSON();
    // console.log(chalk.blue(`Hey, ${options.name}!`));
    // console.log(chalk.green(`Hey, ${options.name}!`));
    // console.log(chalk.red(`Hey, ${options.name}!`));
    if (options.connect_oauth) {
      await OAuthConnection();
    } else if (options.refresh_token) {
      await getOrRefreshCalendlyAccessToken();
    } else if (options.tool) {
      get_availability(scheduleData, "", "", "procedure");
    } else {
      await initializeCall(scheduleData);
    }
  });

program.parse(process.argv);

async function initializeCall(scheduleData: any) {
  const sysPrompt = await importSystemPrompt();
  if (!sysPrompt) {
    console.error("Sys Prompt empty");
  }
  const rl = initializeReadLineInterface();
  let session = {
    id: 1,
    instructions: sysPrompt || "",
    tools: [],
    schema: {},
    conversation: [
      {
        role: "system",
        content: sysPrompt,
      },
    ],
  };
  const llm = initializeLLM(session);
  while (true) {
    // Insert LLM Reply
    const callerInput = await rl.question("You: ");
    // Make LLM Request
    session = await callLLM(llm, callerInput, session);
    const llmResponse = session.conversation[session.conversation.length - 1];
    console.log(`Assistant: ${llmResponse.content}`);
    if (callerInput.toLowerCase() === "exit") {
      break;
    }
  }

  rl.close();
}

async function callLLM(llm: ChatOpenAI, callerInput: string, session: any) {
  let newSession = session;
  newSession.conversation = [
    ...newSession.conversation,
    {
      role: "user",
      content: callerInput,
    },
  ];
  const response = await llm.invoke(newSession.conversation);
  // console.log(response);

  let assistantContent: string;

  if (typeof response.content === "string") {
    assistantContent = response.content;
  } else if (Array.isArray(response.content)) {
    assistantContent = response.content
      .map((block: any) => block.text ?? "")
      .join(" ");
  } else if (response.content && typeof response.content === "object") {
    const contentObj = response.content as { text?: string };
    assistantContent = contentObj.text ?? "";
  } else {
    assistantContent = "";
  }

  newSession.conversation = [
    ...newSession.conversation,
    {
      role: "assistant",
      content: assistantContent,
    },
  ];

  return newSession;
}

function initializeLLM(session: any) {
  const llm = new ChatOpenAI({
    model: "gpt-4.1-nano",
    temperature: 0.85,
    topP: 0.8,
    useResponsesApi: true,
  });

  return llm;
}

async function importSystemPrompt(): Promise<string> {
  // const instructionsPath = join("./instructions");
  const sysPrompt = await readFile("./instructions/system_prompt.md", "utf8");
  if (!sysPrompt) {
    console.error("Error loading system prompt md file");
  }
  return sysPrompt;
}

function initializeReadLineInterface() {
  const rl = readline.createInterface({ input, output });
  return rl;
}

async function OAuthConnection() {
  const calendlyAuthData = await readTokenFromFile();

  if (!calendlyAuthData.created_at || !calendlyAuthData.expires_in) {
    console.log("Auth Data malformed.");
  } else {
    if (Object.keys(calendlyAuthData).length > 0) {
      if (
        !isTokenExpired(
          calendlyAuthData.created_at,
          calendlyAuthData.expires_in
        )
      ) {
        console.log("Auth Data already exists. And is not expired.");
        return;
      }
    }
  }

  const OAuthStateToken = generateOAuthStateToken();
  const url = buildCalendlyOAuthUrl(OAuthStateToken);
  const server = await initializeTempServer(OAuthStateToken);
  const rl = initializeReadLineInterface();
  await rl.question(`Click the link, login, then click enter to confirm:
        
  ${url}`);
  server.close();
  return;
}
