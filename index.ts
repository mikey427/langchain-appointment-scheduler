#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

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
  const rl = readline.createInterface({ input, output });
  while (true) {
    // Insert LLM Reply
    const answer = await rl.question("What do you think of Node.js? ");
    // Make LLM Request

    if (answer.toLowerCase() === "exit") {
      break;
    }
  }

  rl.close();
}

async function callLLM() {}

async function initializeLLM() {
  const llm = new ChatOpenAI({
    model: "gpt-4.1-nano",
    temperature: 0.85,
    topP: 0.8,
  });

  return llm;
}
