import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// app.get("/", (req: express.Request, res: express.Response) => {
//     res.send("Hello World!");
// });

app.post("/init", (req: express.Request, res: express.Response) => {
    console.log("Hit")
    res.send("Inited.")
})

app.post("/chat", (req: express.Request, res: express.Response) => {
    console.log("req.body", req.body);
    res.send("MESSAGE RECEIVED.");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
