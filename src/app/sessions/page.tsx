"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, History, Plus, Sparkles } from "lucide-react";
import { PageShell } from "@/components/app-header";
import { SessionList } from "@/components/session-list";
import { Button, ButtonLink, Card, PageTitle, Skeleton, StagePill } from "@/components/ui";
import { useDisha } from "@/lib/store";
import { useAppUser } from "@/lib/user";

export default function AllSessionsPage() {
  const router = useRouter();
  const { user } = useAppUser();
  const { data, ready, createSession, togglePin, deleteSession } = useDisha(user?.id);
  const [businessId, setBusinessId] = useState("");

  const businesses = data?.businesses ?? [];
  const chosen = businesses.find((b) => b.id === (businessId || businesses[0]?.id));

  return (
    <PageShell>
      <PageTitle eyebrow="All Sessions" title="Your boardroom sessions">
        Reopen a previous session, or start a new one for any of your businesses.
      </PageTitle>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex h-fit flex-col gap-5 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-accent" /> New Session
          </div>
          {!ready && <Skeleton className="h-24" />}
          {ready && businesses.length === 0 && (
            <div className="flex flex-col gap-3 text-sm text-muted">
              Create a business first. Its stage decides your board.
              <ButtonLink href="/businesses/new" variant="secondary" className="w-fit">
                <Plus className="h-4 w-4" /> New business
              </ButtonLink>
            </div>
          )}
          {ready && businesses.length > 0 && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-2">Business</span>
                <select
                  className="h-11 rounded-xl border border-line bg-surface px-3 text-[15px] outline-none focus:border-ink/40 focus:ring-4 focus:ring-accent/10"
                  value={chosen?.id}
                  onChange={(e) => setBusinessId(e.target.value)}
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </label>
              {chosen && (
                <div className="flex items-center justify-between text-sm text-muted">
                  Stage <StagePill stage={chosen.stage} />
                </div>
              )}
              <Button
                onClick={() => {
                  if (!chosen) return;
                  const s = createSession(chosen.id);
                  router.push(`/boardroom/${s.id}`);
                }}
              >
                Start new session <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <History className="h-4 w-4 text-muted" /> Previous Sessions
          </div>
          {!ready ? (
            <Skeleton className="h-40" />
          ) : (
            <SessionList
              sessions={data!.sessions}
              businesses={businesses}
              showBusiness
              onTogglePin={togglePin}
              onDelete={deleteSession}
            />
          )}
        </Card>
      </div>
    </PageShell>
  );
}
