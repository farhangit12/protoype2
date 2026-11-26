"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";
import { Logo } from "./logo";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sessions", label: "All Sessions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Personalised Call" },
];

export function AppHeader() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/dashboard" aria-label="Disha home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                path.startsWith(n.href) ? "bg-surface text-ink shadow-[var(--shadow-soft)] ring-1 ring-line" : "text-muted hover:text-ink",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <UserMenu />
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line/70 px-4 py-2 md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={clsx(
              "whitespace-nowrap rounded-full px-3 py-1 text-[13px]",
              path.startsWith(n.href) ? "bg-surface text-ink ring-1 ring-line" : "text-muted",
            )}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className={clsx("mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:py-14", className)}>{children}</main>
    </div>
  );
}
