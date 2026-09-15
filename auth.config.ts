import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

const providers: NextAuthConfig["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    Discord({
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const authConfig = {
  providers,
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
} satisfies NextAuthConfig;
