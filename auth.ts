import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { upsertLinkedAccount } from "@/lib/links";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.name,
          image: user.avatarUrl ?? user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user?.id) {
        token.id = user.id;
      }
      if (account?.provider === "discord" && token.id) {
        const username =
          (profile as { username?: string } | undefined)?.username ??
          user?.name ??
          "discord";
        await upsertLinkedAccount({
          userId: String(token.id),
          platform: "discord",
          handle: username,
          verified: true,
          profileUrl: null,
          externalId: account.providerAccountId,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          displayName:
            user.name ?? user.email?.split("@")[0] ?? "Player",
          avatarUrl: user.image,
        },
      });
    },
    async linkAccount({ user, account, profile }) {
      if (!user.id) return;
      if (account.provider === "discord") {
        const username =
          (profile as { username?: string } | undefined)?.username ??
          user.name ??
          "discord";
        await upsertLinkedAccount({
          userId: user.id,
          platform: "discord",
          handle: username,
          verified: true,
          externalId: account.providerAccountId,
        });
      }
    },
  },
});
