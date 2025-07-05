import express from 'express';
import { db } from '@repo/db/dist';

const app = express();
const port = 3001;

app.use(express.json());


app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    const { userId, zapId } = req.params;
    const data = req.body;
    console.log("Received data:", data);

    try {
        await db.$transaction(async (tx) => {
        const run = await tx.zapRun.create({
            data: {
                zapId: zapId,
                metaData: data
            }
        })
        await tx.zapRunOutBox.create({
            data: {
                zapRunId: run.id
            }
        })
    })
    res.status(200).json({ message: "ok"});
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`HookAPI listening at http://localhost:${port}`);
}
);