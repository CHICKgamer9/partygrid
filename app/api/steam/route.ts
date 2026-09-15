import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { publicAppUrl } from "@/lib/constants";
import { steamOpenIdRedirect } from "@/lib/steam";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", publicAppUrl()));
  }
  const returnTo = `${publicAppUrl()}/api/steam/callback`;
  return NextResponse.redirect(steamOpenIdRedirect(returnTo));
}
