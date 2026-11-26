import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { clerkEnabled } from "@/lib/auth-mode";

export const metadata: Metadata = {
  title: "Disha Boardroom",
  description: "An AI boardroom for students and first-time founders, by Disha Startup Advisory.",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#17171a",
    colorText: "#17171a",
    colorTextSecondary: "#75757e",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    borderRadius: "12px",
    fontFamily: "Inter Variable, system-ui, sans-serif",
  },
  elements: {
    card: "shadow-none border border-[#e8e6e0]",
    formButtonPrimary: "rounded-full",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
  return clerkEnabled ? <ClerkProvider appearance={clerkAppearance}>{body}</ClerkProvider> : body;
}
