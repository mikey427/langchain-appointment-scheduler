import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { initializeCall, initializeLLM, callLLM } from "../index"
import { initalizeNewSession, retrieveSession } from "./session";
import {tools} from "../tools/index"
import dotenv from "dotenv";




const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });


const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// app.get("/", (req: express.Request, res: express.Response) => {
//     res.send("Hello World!");
// });

const llm = initializeLLM();
const llmWithTools = llm.bindTools(tools);


app.post("/init", async (req: express.Request, res: express.Response) => {
    // console.log("Hit")
    const session = await initalizeNewSession()
    res.json({success: true, id: session.id})
})

app.post("/chat", async (req: express.Request, res: express.Response) => {
    console.log("req.body", req.body);
    const id = req.body.id;
    const input = req.body.message;

    const session = retrieveSession(id);

    // console.log("session: ", session)

    const updatedSession = await callLLM(llmWithTools, input, session)
    res.json({success: true, data: updatedSession});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
