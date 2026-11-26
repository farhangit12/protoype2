import { Logo } from "./logo";
import { Mascot } from "./mascot";

/** Two-column frame for sign-in and sign-up: brand on the left, Clerk form on the right. */
export function AuthSplit({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-surface p-12 lg:flex">
        <Logo size="lg" />
        <div className="flex flex-col gap-8">
          <div className="flex items-end gap-3">
            <Mascot role="cmo" size={84} />
            <div className="-mb-2">
              <Mascot role="strategist" stage="ideation" size={112} />
            </div>
            <Mascot role="ff" size={84} />
          </div>
          <h1 className="font-display text-5xl leading-[1.05] text-ink">
            Your startup&rsquo;s boardroom,
            <br />
            <span className="italic text-accent">on call.</span>
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-muted">
            Ask one question. A Strategist brings in the right specialists for your stage, and you get
            one clear answer back.
          </p>
        </div>
        <p className="text-xs text-faint">Disha Startup Advisory · Prototype</p>
      </section>
      <section className="flex items-center justify-center bg-paper p-6">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="lg:hidden">
            <Logo size="lg" />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
