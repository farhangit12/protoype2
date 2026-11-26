"use client";

import clsx from "clsx";
import Link from "next/link";
import { MessageSquare, Pin, PinOff, Trash2 } from "lucide-react";
import type { Business, Session } from "@/lib/types";
import { relativeTime } from "./ui";

function groupLabel(ts: number): string {
  const day = 86400000;
  const startToday = new Date().setHours(0, 0, 0, 0);
  if (ts >= startToday) return "Today";
  if (ts >= startToday - day) return "Yesterday";
  if (ts >= startToday - 7 * day) return "Previous 7 days";
  if (ts >= startToday - 30 * day) return "Previous 30 days";
  return "Older";
}

/** ChatGPT-style history: Pinned first, then Recent grouped by date. */
export function SessionList({
  sessions,
  businesses,
  activeId,
  compact = false,
  showBusiness = false,
  onTogglePin,
  onDelete,
}: {
  sessions: Session[];
  businesses?: Business[];
  activeId?: string;
  compact?: boolean;
  showBusiness?: boolean;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  // Like ChatGPT, untouched sessions are not listed (except the one that is open).
  const sorted = sessions
    .filter((s) => s.messages.length > 0 || s.id === activeId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const pinned = sorted.filter((s) => s.pinned);
  const recent = sorted.filter((s) => !s.pinned);
  const groups: { label: string; items: Session[] }[] = [];
  for (const s of recent) {
    const label = groupLabel(s.updatedAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(s);
    else groups.push({ label, items: [s] });
  }

  if (sorted.length === 0) {
    return (
      <div className={clsx("text-sm text-muted", compact ? "px-3 py-4" : "rounded-xl border border-dashed border-line-strong px-6 py-10 text-center")}>
        No sessions yet.
      </div>
    );
  }

  const row = (s: Session) => {
    const biz = businesses?.find((b) => b.id === s.businessId);
    return (
      <div
        key={s.id}
        className={clsx(
          "group relative flex items-center rounded-lg transition-colors",
          s.id === activeId ? "bg-surface ring-1 ring-line shadow-[var(--shadow-soft)]" : "hover:bg-sunken/80",
        )}
      >
        <Link href={`/boardroom/${s.id}`} className={clsx("flex min-w-0 flex-1 items-center gap-2.5", compact ? "px-3 py-2" : "px-3 py-2.5")}>
          {!compact && <MessageSquare className="h-4 w-4 shrink-0 text-faint" />}
          <div className="min-w-0 flex-1">
            <div className={clsx("truncate text-ink", compact ? "text-[13px]" : "text-sm font-medium")}>{s.title}</div>
            {!compact && (
              <div className="truncate text-xs text-muted">
                {showBusiness && biz ? `${biz.name} · ` : ""}
                {s.messages.length} {s.messages.length === 1 ? "message" : "messages"} · {relativeTime(s.updatedAt)}
              </div>
            )}
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <IconBtn label={s.pinned ? "Unpin" : "Pin"} onClick={() => onTogglePin(s.id)}>
            {s.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </IconBtn>
          <IconBtn
            label="Delete"
            onClick={() => {
              if (confirm(`Delete "${s.title}"?`)) onDelete(s.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {pinned.length > 0 && (
        <Group label="Pinned">{pinned.map(row)}</Group>
      )}
      {groups.map((g) => (
        <Group key={g.label} label={g.label}>
          {g.items.map(row)}
        </Group>
      ))}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-faint">{label}</div>
      {children}
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-line/60 hover:text-ink"
    >
      {children}
    </button>
  );
}
