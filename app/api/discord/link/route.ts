import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { publicAppUrl } from "@/lib/constants";

export async function GET() {
  const session = await auth();
  const origin = publicAppUrl();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", origin));
  }
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/settings/accounts?discord=unconfigured", origin),
    );
  }
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "identify",
    redirect_uri: `${origin}/api/discord/callback`,
  });
  return NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`,
  );
}
