"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, History, Sparkles } from "lucide-react";
import { PageShell } from "@/components/app-header";
import { BoardPreview } from "@/components/board-preview";
import { SessionList } from "@/components/session-list";
import { Button, ButtonLink, Card, Skeleton, StagePill } from "@/components/ui";
import { ROLES, stageById } from "@/lib/stages";
import { useDisha } from "@/lib/store";
import { useAppUser } from "@/lib/user";

export default function BusinessSessionsPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const router = useRouter();
  const { user } = useAppUser();
  const { data, ready, createSession, togglePin, deleteSession } = useDisha(user?.id);

  if (!ready) {
    return (
      <PageShell>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-8 h-64" />
      </PageShell>
    );
  }

  const business = data!.businesses.find((b) => b.id === businessId);
  if (!business) {
    return (
      <PageShell>
        <p className="text-muted">This business wasn&rsquo;t found on this device.</p>
        <ButtonLink href="/dashboard" variant="secondary" className="mt-4">Back to dashboard</ButtonLink>
      </PageShell>
    );
  }

  const stage = stageById(business.stage);
  const sessions = data!.sessions.filter((s) => s.businessId === business.id);

  function startNew() {
    const s = createSession(business!.id);
    router.push(`/boardroom/${s.id}`);
  }

  return (
    <PageShell>
      <ButtonLink href="/dashboard" variant="ghost" className="-ml-3 mb-6">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </ButtonLink>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Sessions</span>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <StagePill stage={business.stage} />
            <span>{business.industry}</span>
            <span aria-hidden>·</span>
            <span>{business.size}</span>
            <span aria-hidden>·</span>
            <span>{business.employees} {business.employees === 1 ? "person" : "people"}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* New session */}
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-accent" /> New Session
          </div>
          <div className="flex flex-col items-center gap-5 rounded-xl bg-paper px-4 py-8 text-center">
            <BoardPreview stage={business.stage} size={52} />
            <div>
              <div className="font-display text-2xl text-ink">{stage.label} boardroom</div>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                Strategist with {stage.specialists.map((r) => ROLES[r].name).join(", ")}. The stage is
                already set for this business.
              </p>
            </div>
            <Button onClick={startNew}>
              Start new session <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Previous sessions */}
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <History className="h-4 w-4 text-muted" /> Previous Sessions
          </div>
          <SessionList sessions={sessions} onTogglePin={togglePin} onDelete={deleteSession} />
        </Card>
      </div>
    </PageShell>
  );
}
