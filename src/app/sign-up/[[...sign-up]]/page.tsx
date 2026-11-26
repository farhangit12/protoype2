import { SignUp } from "@clerk/nextjs";
import { AuthSplit } from "@/components/auth-split";
import { DemoAuthCard } from "@/components/demo-auth-card";
import { clerkEnabled } from "@/lib/auth-mode";

export default function SignUpPage() {
  return (
    <AuthSplit>
      {clerkEnabled ? (
        <SignUp signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
      ) : (
        <DemoAuthCard mode="sign-up" />
      )}
    </AuthSplit>
  );
}
