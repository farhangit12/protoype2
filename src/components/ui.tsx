import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { stageById } from "@/lib/stages";
import type { AgentStatus, StageId, Verdict } from "@/lib/types";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-2 h-10 px-5",
  secondary: "bg-surface text-ink border border-line hover:border-line-strong hover:bg-sunken/60 h-10 px-5",
  ghost: "text-ink-2 hover:bg-sunken h-9 px-3",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={clsx(base, variants[variant], className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={clsx("rounded-2xl border border-line bg-surface shadow-[var(--shadow-soft)]", className)}
      {...props}
    />
  );
}

export function StagePill({ stage, className }: { stage: StageId; className?: string }) {
  const s = stageById(stage);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-2",
        className,
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
        {s.number}
      </span>
      {s.label}
    </span>
  );
}

const STATUS_STYLE: Record<AgentStatus, string> = {
  waiting: "bg-sunken text-muted border-line",
  working: "bg-accent-soft text-accent border-accent/20",
  completed: "bg-ok-soft text-ok border-ok/20",
  skipped: "bg-surface text-faint border-line border-dashed",
};

export function StatusTag({ status }: { status: AgentStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        STATUS_STYLE[status],
      )}
    >
      {status === "working" && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-soft-pulse" />}
      {status === "waiting" && <span className="h-1.5 w-1.5 rounded-full bg-faint" />}
      {status === "completed" && <Check className="h-3 w-3" strokeWidth={2.5} />}
      {status === "skipped" && <Minus className="h-3 w-3" strokeWidth={2.5} />}
      {status}
    </span>
  );
}

const VERDICT: Record<Exclude<Verdict, "info">, { label: string; cls: string }> = {
  viable: { label: "Viable", cls: "bg-ok-soft text-ok border-ok/20" },
  conditional: { label: "Viable with conditions", cls: "bg-warn-soft text-warn border-warn/20" },
  not_workable: { label: "Not workable as proposed", cls: "bg-bad-soft text-bad border-bad/20" },
};

export function VerdictBadge({ verdict }: { verdict?: Verdict }) {
  if (!verdict || verdict === "info") return null;
  const v = VERDICT[verdict];
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", v.cls)}>
      {v.label}
    </span>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow && <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{eyebrow}</span>}
      <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h1>
      {children && <p className="max-w-2xl text-[15px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-xl bg-sunken", className)} />;
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
