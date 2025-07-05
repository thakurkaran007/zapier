import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@repo/db/src'
import { getUserByID } from '@/data/user'


export const {  
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    events: {
        async linkAccount({ user }) {
            await db.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            })
        }
    },
    callbacks: {    
        async signIn({ user, account }) {
            if (account?.provider !== "credentials") return true;
            if (!user.id) return false;
            const existing = await getUserByID(user.id);
            if (!existing?.emailVerified) return false;

            return true;
        },
        async session({ session, token, user }) {
            if (token.sub && session.user)  {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }) {
            if (!token.sub) return token;
            const existing = await getUserByID(token.sub);
            if (!existing) return token;
            token.role = existing.role;
            return token;
        }
    },
    session: { strategy: 'jwt' },
    adapter: PrismaAdapter(db),
    ...authConfig,
})