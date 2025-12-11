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
import { tools } from "./tools/index.ts";
import { toolHandler } from "./tools/index.ts";

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
      get_availability(scheduleData, "procedure");
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
  const llmWithTools = llm.bindTools(tools);
  while (true) {
    // Insert LLM Reply
    const callerInput = await rl.question("You: ");
    // Make LLM Request
    session = await callLLM(llmWithTools, callerInput, session);
    const llmResponse = session.conversation[session.conversation.length - 1];
    console.log(`Assistant: ${llmResponse.content}`);
    if (callerInput.toLowerCase() === "exit") {
      break;
    }
  }

  rl.close();
}

async function callLLM(llm: any, callerInput: string | null, session: any) {
  let newSession = session;
  if (callerInput !== null) {
    newSession.conversation = [
      ...newSession.conversation,
      {
        role: "user",
        content: callerInput,
      },
    ];
  }
  const response = await llm.invoke(newSession.conversation);
  // console.log(response);

  let assistantContent: string;

  if (response.tool_calls.length > 0) {
    // Call tools and append to conversation
    // console.log(response);

    const resultsArray: any[] = [];
    for (const tool_call of response.tool_calls) {
      const result = await toolHandler(tools, tool_call);
      resultsArray.push(result);
    }

    assistantContent = `
╔════════════════════════════════════════╗
║           TOOL CALL EXECUTED           ║
╚════════════════════════════════════════╝
${response.tool_calls
  .map(
    (call: any, index: number) => `
Tool #${index + 1}: ${call.name}
Arguments: ${JSON.stringify(call.args, null, 2)}
Result: ${JSON.stringify(resultsArray[index], null, 2)}
${"─".repeat(40)}
`
  )
  .join("\n")}
`;

    newSession.conversation = [
      ...newSession.conversation,
      {
        role: "assistant",
        content: response.content,
        tool_calls: response.tool_calls,
      },
    ];

    response.tool_calls.forEach((tool_call: any, index: number) => {
      newSession.conversation.push({
        role: "tool",
        tool_call_id: tool_call.id,
        name: tool_call.name,
        content:
          typeof resultsArray[index] === "string"
            ? resultsArray[index]
            : JSON.stringify(resultsArray[index]),
      });
    });

    console.log(assistantContent);
    return await callLLM(llm, null, newSession);
  } else {
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
  }

  return newSession;
}

function initializeLLM(session: any) {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    // model: "gpt-4o",
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
