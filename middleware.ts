import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/api/webhooks/register", "/signin", "/signup"];
const matchPublicRoutes = createRouteMatcher(publicRoutes);

export const middleware = clerkMiddleware(async (authFn, req) => {
  const { userId } = await authFn(); // Extract user ID from authentication function

  // Redirect unauthenticated users trying to access protected routes
  if (!userId && !matchPublicRoutes(req)) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (userId) {
    try {
      // Fetch user data from Clerk
      const user = await clerkClient.users.getUser(userId);
      const role = user.publicMetadata.role;

      // Admin redirection logic
      if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      // Prevent non-admin users from accessing admin routes
      if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Redirect authenticated users trying to access public routes
      if (matchPublicRoutes(req)) {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
        );
      }
    } catch (error) {
      console.error("Error fetching user data from Clerk:", error);
      return NextResponse.redirect(new URL("/error", req.url));
    }
  }
});

// ✅ Ensure middleware is applied correctly
export const config = {
  matcher: [
    // Apply middleware to all routes except static files
    "/((?!_next|.*\\.(?:html?|css|js|jpe?g|png|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
