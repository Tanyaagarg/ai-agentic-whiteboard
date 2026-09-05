import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything behind sign-in. /workspace was missing before, so an anonymous
// visitor got the canvas shell and a wall of 401s from the API instead of the
// sign-in page.
const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/dashboard/:path*",
  "/workspace/:path*",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html|css|js|gif|svg|jpg|jpeg|png|woff|woff2|ico|csv|docx|xlsx|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
