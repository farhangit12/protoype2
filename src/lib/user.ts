"use client";

import { useUser } from "@clerk/nextjs";
import { clerkEnabled } from "./auth-mode";

export interface AppUser {
  id: string;
  name: string;
  firstName: string;
  email: string;
  imageUrl?: string;
  createdAt?: number;
}

const DEMO_USER: AppUser = {
  id: "demo-founder",
  name: "Demo Founder",
  firstName: "Founder",
  email: "demo@disha.local",
};

function useClerkAppUser(): { loaded: boolean; user: AppUser | null } {
  const { isLoaded, user } = useUser();
  if (!isLoaded || !user) return { loaded: isLoaded, user: null };
  const name = user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Founder";
  return {
    loaded: true,
    user: {
      id: user.id,
      name,
      firstName: user.firstName || name.split(" ")[0],
      email: user.primaryEmailAddress?.emailAddress ?? "",
      imageUrl: user.imageUrl,
      createdAt: user.createdAt?.getTime(),
    },
  };
}

function useDemoUser(): { loaded: boolean; user: AppUser | null } {
  return { loaded: true, user: DEMO_USER };
}

/** The signed-in founder: Clerk's user, or a demo founder when Clerk keys are not set. */
export const useAppUser = clerkEnabled ? useClerkAppUser : useDemoUser;
