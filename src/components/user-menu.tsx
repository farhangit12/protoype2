"use client";

import { UserButton } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/auth-mode";
import { useAppUser } from "@/lib/user";
import { Avatar } from "./avatar";

export function UserMenu() {
  const { user } = useAppUser();
  if (clerkEnabled) {
    return <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />;
  }
  return (
    <div className="flex items-center gap-2" title="Demo mode: add Clerk keys to enable sign-in">
      <span className="hidden rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[11px] text-muted sm:inline">
        Demo mode
      </span>
      <Avatar name={user?.name ?? "F"} size={32} />
    </div>
  );
}
