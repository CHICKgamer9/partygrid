import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const writePaths = [
  "/lfg/new",
  "/clips/new",
  "/squads/new",
  "/settings",
  "/onboarding",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const needsAuth =
    writePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.endsWith("/edit");

  if (needsAuth && !req.auth) {
    const url = new URL("/signin", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: [
    "/lfg/new",
    "/lfg/:id/edit",
    "/clips/new",
    "/squads/new",
    "/settings/:path*",
    "/onboarding",
  ],
};
