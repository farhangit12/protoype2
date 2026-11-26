"use client";

import clsx from "clsx";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertCircle, ArrowLeft, FileText, LayoutDashboard, Menu, PhoneCall, Plus, X } from "lucide-react";
import { BoardStage, BoardStrip } from "@/components/board-stage";
import { Composer } from "@/components/composer";
import { Logo } from "@/components/logo";
import { Mascot } from "@/components/mascot";
import { SessionList } from "@/components/session-list";
import { ButtonLink, Skeleton, StagePill, StatusTag, VerdictBadge } from "@/components/ui";
import { UserMenu } from "@/components/user-menu";
import { makeMessage } from "@/lib/id";
import { ROLES, stageById } from "@/lib/stages";
import { useDisha } from "@/lib/store";
import type { AgentStatus, Attachment, BoardEntry, BoardEvent, Business, Message, RoleId, Session } from "@/lib/types";
import { useAppUser } from "@/lib/user";

type Statuses = Partial<Record<RoleId, AgentStatus>>;

export default function BoardroomPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  // Keyed by session, so live state resets when switching sessions.
  return <Boardroom key={sessionId} sessionId={sessionId} />;
}

function Boardroom({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { user } = useAppUser();
  const store = useDisha(user?.id);
  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState<Statuses>({});
  const [drawer, setDrawer] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const session = store.data?.sessions.find((s) => s.id === sessionId);
  const business = store.data?.businesses.find((b) => b.id === session?.businessId);
  const messageCount = session?.messages.length ?? 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messageCount, running]);

  if (!store.ready) {
    return (
      <div className="flex h-screen">
        <div className="hidden w-72 border-r border-line p-4 lg:block"><Skeleton className="h-full" /></div>
        <div className="flex-1 p-8"><Skeleton className="h-full" /></div>
      </div>
    );
  }

  if (!session || !business) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted">This session wasn&rsquo;t found on this device.</p>
        <ButtonLink href="/sessions" variant="secondary">All sessions</ButtonLink>
      </div>
    );
  }

  const stage = stageById(business.stage);
  const roster: RoleId[] = ["strategist", ...stage.specialists];

  async function ask(text: string, attachments: Attachment[]) {
    if (!session || !business || running) return;
    const history = session.messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content }));
    store.addMessage(
      session.id,
      makeMessage({ role: "founder", content: text, attachments: attachments.length ? attachments : undefined }),
    );

    setRunning(true);
    const live: Statuses = Object.fromEntries(roster.map((r) => [r, "waiting"])) as Statuses;
    live.strategist = "working";
    setStatuses({ ...live });
    const tasks: Partial<Record<RoleId, string>> = {};

    const finish = (msg: Omit<Message, "id" | "createdAt" | "role">) => {
      const board: BoardEntry[] = stage.specialists.map((r) => ({ role: r, status: live[r] ?? "skipped", task: tasks[r] }));
      store.addMessage(session.id, makeMessage({ role: "strategist", board, ...msg }));
    };

    try {
      const res = await fetch("/api/boardroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: pickBusiness(business),
          query: text,
          history,
          attachments: attachments.map((a) => a.name),
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        buffer += decoder.decode(chunk.value ?? new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as BoardEvent;
          if (ev.type === "plan") {
            ev.tasks.forEach((t) => (tasks[t.role] = t.task));
            ev.skipped.forEach((r) => (live[r] = "skipped"));
            setStatuses({ ...live });
          } else if (ev.type === "status") {
            live[ev.role] = ev.status;
            setStatuses({ ...live });
          } else if (ev.type === "final") {
            live.strategist = "completed";
            setStatuses({ ...live });
            finish({ content: ev.answer, verdict: ev.verdict });
          } else if (ev.type === "error") {
            throw new Error(ev.message);
          }
        }
      }
    } catch (e) {
      live.strategist = "waiting";
      for (const r of stage.specialists) if (live[r] === "working") live[r] = "waiting";
      setStatuses({ ...live });
      finish({ content: e instanceof Error ? e.message : "Something went wrong.", error: true });
    } finally {
      setRunning(false);
    }
  }

  function newSession() {
    const s = store.createSession(business!.id);
    router.push(`/boardroom/${s.id}`);
  }

  const businessSessions = store.data!.sessions.filter((s) => s.businessId === business.id);
  const empty = session.messages.length === 0 && !running;

  const sidebar = (
    <Sidebar
      business={business}
      sessions={businessSessions}
      activeId={session.id}
      onNew={newSession}
      onTogglePin={store.togglePin}
      onDelete={(id) => {
        store.deleteSession(id);
        if (id === session.id) router.push(`/businesses/${business.id}`);
      }}
    />
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-paper">
      {/* Sidebar: desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-line bg-paper lg:flex">{sidebar}</aside>
      {/* Sidebar: mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close" className="absolute inset-0 bg-ink/20" onClick={() => setDrawer(false)} />
          <aside className="relative flex h-full w-[85%] max-w-xs border-r border-line bg-paper shadow-[var(--shadow-lift)]">
            <button aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute right-3 top-4 rounded-md p-1 text-muted hover:bg-sunken">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Open sessions" onClick={() => setDrawer(true)} className="rounded-md p-1.5 text-ink-2 hover:bg-sunken lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">{session.title}</div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="truncate">{business.name}</span>
                <StagePill stage={business.stage} className="!py-0" />
              </div>
            </div>
          </div>
          <UserMenu />
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Conversation */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
                {empty ? (
                  <div className="flex flex-col items-center gap-2 pt-2 text-center">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Boardroom</span>
                    <h1 className="font-display text-4xl text-ink">for {stage.label}</h1>
                    <p className="max-w-md text-sm text-muted">
                      Ask one question. The Strategist brings in the specialists it needs and gives you one
                      answer.
                    </p>
                    <BoardStage stage={business.stage} statuses={statuses} className="mt-4 hidden max-w-2xl sm:block" />
                    <BoardStage stage={business.stage} statuses={statuses} scale={0.72} className="mt-2 sm:hidden" />
                  </div>
                ) : (
                  <>
                    <div className="xl:hidden">
                      <BoardStrip stage={business.stage} statuses={statuses} />
                    </div>
                    {session.messages.map((m) => (
                      <MessageView key={m.id} message={m} stage={business.stage} />
                    ))}
                    {running && <Working statuses={statuses} roster={stage.specialists} stage={business.stage} />}
                  </>
                )}
                <div ref={endRef} />
              </div>
            </div>
            <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
              <Composer stage={business.stage} disabled={running} onSubmit={ask} />
              <p className="mt-2 text-center text-[11px] text-faint">
                Decision support, not professional advice. Check important decisions with an expert.
              </p>
            </div>
          </div>

          {/* Board rail (wide screens, once the conversation has started) */}
          {!empty && (
            <aside className="hidden w-[360px] shrink-0 flex-col border-l border-line bg-surface/60 xl:flex">
              <div className="border-b border-line px-5 py-4">
                <div className="text-sm font-semibold text-ink">{stage.label} board</div>
                <div className="text-xs text-muted">The Strategist coordinates every answer</div>
              </div>
              <div className="flex flex-1 items-center px-2">
                <BoardStage stage={business.stage} statuses={statuses} scale={0.78} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function pickBusiness(b: Business) {
  return { name: b.name, industry: b.industry, size: b.size, employees: b.employees, stage: b.stage };
}

function Sidebar({
  business,
  sessions,
  activeId,
  onNew,
  onTogglePin,
  onDelete,
}: {
  business: Business;
  sessions: Session[];
  activeId: string;
  onNew: () => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/dashboard" aria-label="Dashboard"><Logo /></Link>
      </div>
      <div className="px-3">
        <Link href={`/businesses/${business.id}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 hover:border-line-strong">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sunken text-sm font-semibold text-ink-2">
            {business.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{business.name}</div>
            <div className="text-xs text-muted">Stage {stageById(business.stage).number} · {stageById(business.stage).label}</div>
          </div>
        </Link>
        <button
          type="button"
          onClick={onNew}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-white hover:bg-ink-2"
        >
          <Plus className="h-4 w-4" /> New session
        </button>
      </div>
      <div className="mt-5 px-2 pb-2">
        <div className="px-3 pb-2 text-xs font-semibold text-ink">Previous sessions</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <SessionList sessions={sessions} activeId={activeId} compact onTogglePin={onTogglePin} onDelete={onDelete} />
      </div>
      <div className="flex flex-col gap-0.5 border-t border-line p-2">
        <SideLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</SideLink>
        <SideLink href="/sessions" icon={<ArrowLeft className="h-4 w-4" />}>All sessions</SideLink>
        <SideLink href="/contact" icon={<PhoneCall className="h-4 w-4" />}>Personalised Call</SideLink>
      </div>
    </div>
  );
}

function SideLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-sunken">
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  );
}

function MessageView({ message, stage }: { message: Message; stage: Business["stage"] }) {
  if (message.role === "founder") {
    return (
      <div className="flex flex-col items-end gap-2">
        {message.attachments && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {message.attachments.map((a) => (
              <span key={a.name} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink-2">
                <FileText className="h-3.5 w-3.5 text-muted" /> {a.name}
              </span>
            ))}
          </div>
        )}
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[15px] leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="shrink-0">
        <Mascot role="strategist" stage={stage} size={36} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink">Strategist</span>
          <VerdictBadge verdict={message.verdict} />
        </div>
        {message.error ? (
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-bad/20 bg-bad-soft px-3 py-2.5 text-sm text-bad">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {message.content}
          </div>
        ) : (
          <div className="prose-answer mt-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
        {message.board && message.board.length > 0 && !message.error && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
            <span className="mr-1 text-[11px] text-faint">Board</span>
            {message.board.map((b) => (
              <span key={b.role} className="inline-flex items-center gap-1" title={b.task}>
                <span className="text-[11px] font-medium text-ink-2">{ROLES[b.role].short}</span>
                <StatusTag status={b.status} />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Working({ statuses, roster, stage }: { statuses: Statuses; roster: RoleId[]; stage: Business["stage"] }) {
  const done = roster.every((r) => statuses[r] === "completed" || statuses[r] === "skipped");
  return (
    <div className="flex gap-3">
      <div className="shrink-0"><Mascot role="strategist" stage={stage} size={36} /></div>
      <div className="flex-1 rounded-2xl border border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-soft-pulse" />
          {statuses.strategist === "working" && roster.every((r) => statuses[r] === "waiting")
            ? "Strategist is reading your question and choosing specialists…"
            : done
              ? "Strategist is reviewing the findings…"
              : "Specialists are working…"}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {roster.map((r) => (
            <span key={r} className={clsx("inline-flex items-center gap-1.5 rounded-full border border-line py-0.5 pl-0.5 pr-1")}>
              <Mascot role={r} stage={stage} size={22} dim={statuses[r] === "skipped"} />
              <span className="text-[11px] font-medium text-ink-2">{ROLES[r].short}</span>
              {statuses[r] && <StatusTag status={statuses[r]!} />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
