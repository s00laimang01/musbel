import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { PATHS } from "./types";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that are accessible to the public
  const publicPaths = ["/auth/sign-in/", "/auth/sign-up/"];
  const isPublicPath = publicPaths.some(
    (path) => pathname.startsWith(path) || pathname.startsWith("/api/auth")
  );

  // Check if the user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect authenticated users away from public pages
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL(PATHS.HOME, request.url));
  }

  // Redirect unauthenticated users to login page
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL(PATHS.SIGNIN, request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/sign-in/",
    "/auth/sign-up/",
    "/api/auth",
    "/api/users/",
  ],
};
