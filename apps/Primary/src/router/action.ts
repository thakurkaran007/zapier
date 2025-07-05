import { db } from "@repo/db/dist";
import { Router } from "express";

const router = Router();

router.get("/available", async (req, res) => {
    const availableActions = await db.availableAction.findMany({});

    res.json({ availableActions });
})

export const actionRouter = router;