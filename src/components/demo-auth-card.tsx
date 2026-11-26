import { ButtonLink, Card } from "./ui";

/** Shown instead of Clerk's form when Clerk keys are not configured. */
export function DemoAuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <Card className="w-full p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-ink">{mode === "sign-in" ? "Sign in" : "Create your account"}</h2>
        <p className="text-sm leading-relaxed text-muted">
          Clerk keys aren&rsquo;t set, so the prototype is running in demo mode. Add
          <code className="mx-1 rounded bg-sunken px-1 text-[12px]">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>
          and
          <code className="mx-1 rounded bg-sunken px-1 text-[12px]">CLERK_SECRET_KEY</code>
          to <code className="rounded bg-sunken px-1 text-[12px]">.env.local</code> to turn on real sign-in.
        </p>
      </div>
      <ButtonLink href="/dashboard" className="mt-6 w-full">
        Continue as demo founder
      </ButtonLink>
    </Card>
  );
}
