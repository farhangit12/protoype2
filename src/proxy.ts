import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const isPublic = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isApi = createRouteMatcher(["/api(.*)"]);

const withClerk = clerkMiddleware(
  async (auth, req) => {
    if (isPublic(req)) return;
    const { userId, redirectToSignIn } = await auth();
    if (userId) return;
    if (isApi(req)) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    return redirectToSignIn({ returnBackUrl: req.url });
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

/** Clerk protects every page except sign-in and sign-up. In demo mode (no Clerk keys) everything is open. */
export default clerkEnabled ? withClerk : function proxy() {
  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
