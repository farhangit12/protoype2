import { SignIn } from "@clerk/nextjs";
import { AuthSplit } from "@/components/auth-split";
import { DemoAuthCard } from "@/components/demo-auth-card";
import { clerkEnabled } from "@/lib/auth-mode";

export default function SignInPage() {
  return (
    <AuthSplit>
      {clerkEnabled ? (
        <SignIn signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
      ) : (
        <DemoAuthCard mode="sign-in" />
      )}
    </AuthSplit>
  );
}
