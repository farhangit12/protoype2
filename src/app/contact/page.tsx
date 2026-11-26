import { Mail, Phone, PhoneCall } from "lucide-react";
import { PageShell } from "@/components/app-header";
import { Card, PageTitle } from "@/components/ui";

const PHONE = "[PHONE NUMBER]";
const EMAIL = "[EMAIL ADDRESS]";

export default function ContactPage() {
  return (
    <PageShell className="max-w-4xl">
      <PageTitle eyebrow="Personalised Call" title="Talk to a Disha consultant">
        Disha Startup Advisory works with students and first-time founders. When you want a human view
        on your idea or your next step, reach a Disha consultant directly.
      </PageTitle>

      <div className="mt-10 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <Card className="flex flex-col items-center gap-6 px-6 py-10 text-center">
          <div className="relative">
            <span className="absolute inset-0 -m-3 rounded-full border border-line" />
            <span className="absolute inset-0 -m-6 rounded-full border border-line/60" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent">
              <PhoneCall className="h-8 w-8" strokeWidth={1.6} />
            </span>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Disha consultant</div>
            <div className="mt-1 font-display text-3xl text-ink">{PHONE}</div>
          </div>
          <a
            aria-disabled
            className="pointer-events-none inline-flex h-11 items-center gap-2 rounded-full bg-ink/40 px-6 text-sm font-medium text-white"
          >
            <Phone className="h-4 w-4" /> Call
          </a>
          <p className="text-xs text-faint">Calling turns on once the real number is added.</p>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-base font-semibold text-ink">Contact details</h2>
          <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={PHONE} />
          <Row icon={<Mail className="h-4 w-4" />} label="Email" value={EMAIL} />
          <p className="mt-auto border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Share your business name and stage when you get in touch, so the consultant can pick up from
            your boardroom sessions.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
      <span className="text-muted">{icon}</span>
      <div>
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-medium text-ink">{value}</div>
      </div>
    </div>
  );
}
