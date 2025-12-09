import { write } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function readScheduleJSON() {
  const filePath = join(__dirname, "schedule.json");
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data);
}

// TODO: File based storage can't handle multiple instances writing at the same time, should be replace by actual DB/calendar logic
export async function writeScheduleJSON(data: any) {
  const filePath = join(__dirname, "schedule.json");
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}
