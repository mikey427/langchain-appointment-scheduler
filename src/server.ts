import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { initializeLLM, callLLM } from "../index";
import { initializeNewSession, retrieveSession } from "./session";
import { tools } from "../tools/index";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const port = 3000;

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 20,
	standardHeaders: "draft-8",
	legacyHeaders: false, 
	ipv6Subnet: 56,
});

app.use('/chat', limiter)
app.use('/init', limiter)
app.use('/verify', limiter)

app.use(express.json());
app.use(cookieParser());

app.use(["/", "/chat", "/init"], (req, res, next) => {
	if (req.cookies?.authorized !== "true") {
		return res.redirect("/login");
		// return res.status(401).json({ error: 'Unauthorized' })
	}
	next();
});

app.use(express.static(__dirname, { extensions: ["html"] }));

// app.get("/", (req: express.Request, res: express.Response) => {
//     res.send("Hello World!");
// });

const llm = initializeLLM();
const llmWithTools = llm.bindTools(tools);

app.post("/init", async (req: express.Request, res: express.Response) => {
	// console.log("Hit")
	const session = await initializeNewSession();
	res.json({ success: true, id: session.id });
});

app.post("/chat", async (req: express.Request, res: express.Response) => {
	console.log("req.body", req.body);
	const id = req.body.id;
	const input = req.body.message;

	const session = retrieveSession(id);

	// console.log("session: ", session)

	const updatedSession = await callLLM(llmWithTools, input, session);
	console.log("updated Session: ", updatedSession);
	res.json({ success: true, data: updatedSession });
});

app.post("/verify", (req, res) => {
	if (req.body.password === process.env.DEMO_PASSWORD) {
		res.cookie("authorized", "true", {
			httpOnly: true,
			secure: true,
			sameSite: "strict", 
		});
		res.redirect("/");
	} else {
		res.status(401).json({ success: false });
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
