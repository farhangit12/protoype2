"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { PageShell } from "@/components/app-header";
import { BoardPreview } from "@/components/board-preview";
import { Button, ButtonLink, Card, PageTitle } from "@/components/ui";
import { BUSINESS_SIZES, INDUSTRIES, ROLES, STAGES } from "@/lib/stages";
import { useDisha } from "@/lib/store";
import type { StageId } from "@/lib/types";
import { useAppUser } from "@/lib/user";

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/40 focus:ring-4 focus:ring-accent/10";

export default function NewBusinessPage() {
  const router = useRouter();
  const { user } = useAppUser();
  const { createBusiness, ready } = useDisha(user?.id);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [otherIndustry, setOtherIndustry] = useState("");
  const [size, setSize] = useState("");
  const [employees, setEmployees] = useState("");
  const [stage, setStage] = useState<StageId | null>(null);
  const [touched, setTouched] = useState(false);

  const finalIndustry = industry === "Other" ? otherIndustry.trim() : industry;
  const employeeCount = Number(employees);
  const valid =
    name.trim().length > 1 &&
    finalIndustry.length > 1 &&
    size &&
    Number.isInteger(employeeCount) &&
    employeeCount >= 1 &&
    stage;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || !stage) return;
    const b = createBusiness({
      name: name.trim(),
      industry: finalIndustry,
      size,
      employees: employeeCount,
      stage,
    });
    router.push(`/businesses/${b.id}`);
  }

  return (
    <PageShell className="max-w-4xl">
      <ButtonLink href="/dashboard" variant="ghost" className="-ml-3 mb-6">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </ButtonLink>
      <PageTitle eyebrow="New business" title="Tell the board about your business">
        The stage you choose sets who sits on your boardroom. It is saved with the business, and every
        new session uses it automatically.
      </PageTitle>

      <form onSubmit={submit} className="mt-10 flex flex-col gap-8">
        <Card className="grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Business name" error={touched && name.trim().length < 2 ? "Enter a name" : undefined}>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kulhad Co." />
          </Field>
          <Field label="Industry" error={touched && finalIndustry.length < 2 ? "Choose an industry" : undefined}>
            <select className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
            {industry === "Other" && (
              <input
                className={clsx(inputCls, "mt-2")}
                value={otherIndustry}
                onChange={(e) => setOtherIndustry(e.target.value)}
                placeholder="Your industry"
              />
            )}
          </Field>
          <Field label="Business size" error={touched && !size ? "Choose a size" : undefined}>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={clsx(
                    "h-11 rounded-xl border text-sm transition-colors",
                    size === s ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-line-strong",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field
            label="Number of employees"
            error={touched && !(Number.isInteger(employeeCount) && employeeCount >= 1) ? "Enter a whole number, 1 or more" : undefined}
          >
            <input
              className={inputCls}
              type="number"
              min={1}
              inputMode="numeric"
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              placeholder="Including founders"
            />
          </Field>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Startup stage</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" /> Chosen once, used for every session
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {STAGES.map((s) => {
              const on = stage === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStage(s.id)}
                  className={clsx(
                    "flex flex-col gap-4 rounded-2xl border bg-surface p-5 text-left transition-all",
                    on ? "border-ink ring-4 ring-accent/10" : "border-line hover:border-line-strong",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-muted">Stage {s.number}</div>
                      <div className="text-lg font-semibold text-ink">{s.label}</div>
                      <div className="text-sm text-muted">{s.blurb}</div>
                    </div>
                    <span
                      className={clsx(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                        on ? "border-ink bg-ink text-white" : "border-line",
                      )}
                    >
                      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                    <BoardPreview stage={s.id} size={30} />
                    <span className="text-right text-xs text-muted">
                      Strategist + {s.specialists.map((r) => ROLES[r].short).join(", ")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {touched && !stage && <p className="text-sm text-bad">Choose a stage</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
          <ButtonLink href="/dashboard" variant="secondary">Cancel</ButtonLink>
          <Button type="submit" disabled={!ready}>Create business</Button>
        </div>
      </form>
    </PageShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-2">{label}</span>
      {children}
      {error && <span className="text-xs text-bad">{error}</span>}
    </label>
  );
}
