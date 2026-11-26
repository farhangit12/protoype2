/**
 * Clerk is used when its publishable key is set. Without it the app runs in a local
 * demo mode (one demo founder), so the prototype can be previewed before Clerk is set up.
 */
export const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
