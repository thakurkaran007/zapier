import { db } from "@repo/db/dist";
import { Router } from "express";

const router = Router();

router.get("/available", async (req, res) => {
    const availableTriggers = await db.availableTrigger.findMany({});

    res.json({availableTriggers});
})

export const triggerRouter = router; 