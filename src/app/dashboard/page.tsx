"use client";

import Link from "next/link";
import { ArrowRight, Building2, MessagesSquare, PhoneCall, Plus } from "lucide-react";
import { PageShell } from "@/components/app-header";
import { Avatar } from "@/components/avatar";
import { BoardPreview } from "@/components/board-preview";
import { ButtonLink, Card, Skeleton, StagePill, relativeTime } from "@/components/ui";
import { useDisha } from "@/lib/store";
import { useAppUser } from "@/lib/user";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const { user } = useAppUser();
  const { data, ready } = useDisha(user?.id);

  return (
    <PageShell>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Dashboard</span>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">
            {greeting()}, {user?.firstName ?? "founder"}.
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Profile */}
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col items-center gap-4 p-6 text-center">
              <Avatar name={user?.name ?? "Founder"} src={user?.imageUrl} size={76} />
              <div>
                <div className="text-base font-semibold text-ink">{user?.name}</div>
                <div className="text-sm text-muted">{user?.email}</div>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 border-t border-line pt-4 text-left">
                <Stat label="Businesses" value={ready ? data!.businesses.length : "–"} />
                <Stat label="Sessions" value={ready ? data!.sessions.length : "–"} />
              </div>
            </Card>

            <Link href="/sessions">
              <Card className="group flex items-center gap-3 p-4 transition-colors hover:border-line-strong">
                <IconTile><MessagesSquare className="h-[18px] w-[18px]" /></IconTile>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">All Sessions</div>
                  <div className="text-xs text-muted">Previous and new boardroom sessions</div>
                </div>
                <ArrowRight className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5" />
              </Card>
            </Link>
            <Link href="/contact">
              <Card className="group flex items-center gap-3 p-4 transition-colors hover:border-line-strong">
                <IconTile><PhoneCall className="h-[18px] w-[18px]" /></IconTile>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">Personalised Call</div>
                  <div className="text-xs text-muted">Talk to a Disha consultant</div>
                </div>
                <ArrowRight className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5" />
              </Card>
            </Link>
          </div>

          {/* Businesses */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Owned startups and businesses</h2>
                <p className="text-sm text-muted">Each business keeps its own stage and sessions.</p>
              </div>
              <ButtonLink href="/businesses/new">
                <Plus className="h-4 w-4" /> New business
              </ButtonLink>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {!ready && [0, 1].map((i) => <Skeleton key={i} className="h-20" />)}
              {ready && data!.businesses.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong px-6 py-14 text-center">
                  <IconTile><Building2 className="h-[18px] w-[18px]" /></IconTile>
                  <div className="text-sm font-semibold text-ink">No businesses yet</div>
                  <p className="max-w-sm text-sm text-muted">
                    Add your first business and pick its stage. Your boardroom is set up from that stage.
                  </p>
                  <ButtonLink href="/businesses/new" variant="secondary" className="mt-1">
                    <Plus className="h-4 w-4" /> Create a business
                  </ButtonLink>
                </div>
              )}
              {ready &&
                data!.businesses.map((b) => {
                  const sessions = data!.sessions.filter((s) => s.businessId === b.id);
                  const last = sessions.reduce((m, s) => Math.max(m, s.updatedAt), 0);
                  return (
                    <Link
                      key={b.id}
                      href={`/businesses/${b.id}`}
                      className="group flex flex-col gap-3 rounded-xl border border-line px-4 py-4 transition-colors hover:border-line-strong hover:bg-paper sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sunken text-sm font-semibold text-ink-2">
                          {b.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-semibold text-ink">{b.name}</div>
                          <div className="text-xs text-muted">
                            {b.industry} · {b.employees} {b.employees === 1 ? "person" : "people"} ·{" "}
                            {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
                            {last ? ` · active ${relativeTime(last)}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <BoardPreview stage={b.stage} size={26} />
                        <StagePill stage={b.stage} />
                        <ArrowRight className="hidden h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5 sm:block" />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-sunken/70 px-3 py-2">
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-paper text-ink-2">
      {children}
    </span>
  );
}
