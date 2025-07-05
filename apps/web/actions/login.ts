"use server";
import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { sendVerificationMail } from "@/lib/mail";
import { generatetVerificationToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { LoginSchema } from "@/schema";
import { AuthError } from "next-auth";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { db } from "@repo/db/src";
import { validateCaptcha } from "@/lib/validateCaptcha";

export const login = async(values: z.infer<typeof LoginSchema>, token: string) => {
    const validation = LoginSchema.safeParse(values);
    if (!validation.success) {
        return {
            error: "Invalid input"
        }
    }
    const { email, password } = validation.data;

    const validateCap = await validateCaptcha(token);

    if (!validateCap) {
        return { error: "Captcha Validation Failed" };
    }

    const existingUser = await getUserByEmail(email);
    if (!existingUser || !existingUser.password) {
        return { error: "Email does not exist" };
    }

    const passVerify = bcrypt.compareSync(password, existingUser?.password);
    if (!passVerify) {
        return { error: "Wrong Password" };
    }
    if (!existingUser.emailVerified) {
        const verificationToken = await generatetVerificationToken(email);
        await sendVerificationMail(email, verificationToken.token);
        return { success: "Confirmation email Sent" };
    } else {
        const token = await getVerificationTokenByEmail(email);
        if (token) {
            const hasExpired = new Date(token.expires) < new Date();
            if (hasExpired) {
                await db.verificationToken.delete({ where: { id: token.id } });
                const verificationToken = await generatetVerificationToken(email);
                await sendVerificationMail(email, verificationToken.token);
                return { success: "Confirmation email Sent" };
            }
        }
    }
    
    try {
        await signIn("credentials", {
            email,  
            password,
            redirect: false
        })
        return { success: "SignIn Successful" }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid Credentials" }
                default:
                    console.error("An unexpected error occurred during sign-in:", error);
                    return { error: "Something Went Wrong" }
            }
        }
        throw error;
    }
}
