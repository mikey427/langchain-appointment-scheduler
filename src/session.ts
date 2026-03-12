import { importSystemPrompt } from "../index";

export const sessions = new Map();

export async function initializeNewSession(){
	const id = crypto.randomUUID();
		const sysPrompt = await importSystemPrompt();
	if (!sysPrompt) {
		console.error("Sys Prompt empty");
	}

	const newSession = {
		id,
		instructions: sysPrompt || "",
		tools: [],
		schema: {},
		conversation: [
			{
				role: "system",
				content: sysPrompt
			},
			{
				role: "assistant",
				content: "Hi! I'm your scheduling assistant. What can I help you book today?"
			}
		]
	}
	sessions.set(id, newSession)

	return newSession
}

export function retrieveSession(id: string) {
	const session = sessions.get(id);
	return session || null;
}

export function deleteSession(id: string) {
	return sessions.delete(id);
}