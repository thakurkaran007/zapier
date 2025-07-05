import { Router, Request, Response } from 'express';
import { db } from '@repo/db/dist'
import { authMiddleware } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { serialize } from 'cookie';

const router = Router();

router.post("/signin", async (req:any, res:any) => {
    const { email, password } = req.body;
    console.log('Received signin request:', email, password);
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await db.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user?.id) {
        return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    res.setHeader('Set-Cookie', serialize("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',           // 🔑 false in localhost
        sameSite: "lax",         // ✅ allows top-level cross-origin GETs
        path: "/",               // 🔑 apply to entire domain
        maxAge: 60 * 60 * 24 * 7 // 7 days
    }));
      
      console.log('djbvbjwvkjnw');

    return res.status(200).json({ message: "User signed in", token: token });
});

router.post("/logout", async (req: any, res: any) => {
    res.clearCookie("access_token");
    return res.status(200).json({ message: "User logged out" });
});


router.get("/", authMiddleware, async (req:any, res:any) => {
    const id = req.id;
    const user = await db.user.findUnique({
        where: {
            id: id
        }
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
        message: "User found",
        user: user
    })
})

export const userRouter = router;