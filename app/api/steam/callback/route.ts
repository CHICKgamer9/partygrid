import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { publicAppUrl } from "@/lib/constants";
import { upsertLinkedAccount } from "@/lib/links";
import {
  extractSteamId,
  fetchSteamSummary,
  verifySteamOpenId,
} from "@/lib/steam";

export async function GET(request: Request) {
  const session = await auth();
  const origin = publicAppUrl();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", origin));
  }

  const url = new URL(request.url);
  const valid = await verifySteamOpenId(url.searchParams);
  const steamId = extractSteamId(url.searchParams.get("openid.claimed_id"));

  if (!valid || !steamId) {
    return NextResponse.redirect(
      new URL("/settings/accounts?steam=failed", origin),
    );
  }

  const summary = await fetchSteamSummary(steamId);
  await upsertLinkedAccount({
    userId: session.user.id,
    platform: "steam",
    handle: summary?.personaName ?? steamId,
    verified: true,
    profileUrl:
      summary?.profileUrl ?? `https://steamcommunity.com/profiles/${steamId}`,
    externalId: steamId,
  });

  return NextResponse.redirect(
    new URL("/settings/accounts?steam=linked", origin),
  );
}
