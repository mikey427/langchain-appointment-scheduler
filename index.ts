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

program
  .version("1.0.0")
  .description("Langchain Appointment Scheduler")
  // .option("-n, --name <type>", "Add your name")
  .action((options) => {
    // console.log(chalk.blue(`Hey, ${options.name}!`));
    // console.log(chalk.green(`Hey, ${options.name}!`));
    // console.log(chalk.red(`Hey, ${options.name}!`));

    initializeCall();
  });

program.parse(process.argv);

async function initializeCall() {
  const llm = initializeLLM();
  const sysPrompt = await importSystemPrompt();
  if (!sysPrompt) {
    console.error("Sys Prompt empty");
  }
  const rl = readline.createInterface({ input, output });
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
