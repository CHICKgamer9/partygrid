import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { publicAppUrl } from "@/lib/constants";
import { upsertLinkedAccount } from "@/lib/links";

export async function GET(request: Request) {
  const session = await auth();
  const origin = publicAppUrl();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", origin));
  }

  const code = new URL(request.url).searchParams.get("code");
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/settings/accounts?discord=failed", origin),
    );
  }

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${origin}/api/discord/callback`,
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL("/settings/accounts?discord=failed", origin),
    );
  }
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) {
    return NextResponse.redirect(
      new URL("/settings/accounts?discord=failed", origin),
    );
  }

  const meRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!meRes.ok) {
    return NextResponse.redirect(
      new URL("/settings/accounts?discord=failed", origin),
    );
  }
  const me = (await meRes.json()) as {
    id: string;
    username: string;
    global_name?: string;
  };

  await upsertLinkedAccount({
    userId: session.user.id,
    platform: "discord",
    handle: me.global_name || me.username,
    verified: true,
    externalId: me.id,
  });

  return NextResponse.redirect(
    new URL("/settings/accounts?discord=linked", origin),
  );
}
