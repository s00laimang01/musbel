import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Define only public routes - everything else requires authentication
const PUBLIC_ROUTES = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forget-password",
  "/api/auth/signin",
  "/api/auth/sign-up",
  "/api/account/bank/verify-transaction",
  // Add any other public routes here
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is public
  const isPublicPath = PUBLIC_ROUTES.some((path) => pathname.startsWith(path));

  // Get the authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Handle authenticated users trying to access public pages (optional redirect)
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle unauthenticated users trying to access protected pages
  if (!isPublicPath && !token) {
    // For API routes, return a proper 401 response
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // For regular routes, redirect to sign-in
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Apply to all routes except static files and other exceptions
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg)).*)",
  ],
};
