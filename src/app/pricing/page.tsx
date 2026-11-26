import clsx from "clsx";
import { Check, Info } from "lucide-react";
import { PageShell } from "@/components/app-header";
import { Card, PageTitle } from "@/components/ui";

const PLANS = [
  { name: "Free", price: "₹0", period: "", sessions: "5" },
  { name: "Starter", price: "₹999", period: "/month", sessions: "30" },
  { name: "Growth", price: "₹2,499", period: "/month", sessions: "40", featured: true },
  { name: "Scale", price: "₹5,999", period: "/month", sessions: "60 + 10 Deep" },
];

export default function PricingPage() {
  return (
    <PageShell>
      <PageTitle eyebrow="Pricing" title="Simple plans, by sessions">
        A demonstration of how plans could look. Nothing here can be bought.
      </PageTitle>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-warn/30 bg-warn-soft px-5 py-4 text-warn">
        <Info className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold tracking-wide">EXAMPLE DATA — NOT ACTUAL DISHA PRICING</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <Card
            key={p.name}
            className={clsx("flex flex-col gap-5 p-6", p.featured && "border-ink ring-4 ring-accent/10")}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{p.name}</span>
              <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                Example
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl text-ink">{p.price}</span>
              <span className="text-sm text-muted">{p.period}</span>
            </div>
            <div className="flex items-center gap-2 border-t border-line pt-4 text-sm text-ink-2">
              <Check className="h-4 w-4 text-ok" /> {p.sessions} sessions
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-xs text-faint">Static demonstration values. No payment processing.</p>
    </PageShell>
  );
}
