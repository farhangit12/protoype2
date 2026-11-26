import clsx from "clsx";
import { ROLES, stageById } from "@/lib/stages";
import type { AgentStatus, RoleId, StageId } from "@/lib/types";
import { Mascot } from "./mascot";
import { StatusTag } from "./ui";

type Seat = { x: number; y: number };

/** Each stage has its own seating. The Strategist is always the central coordinator. */
const LAYOUTS: Record<StageId, Partial<Record<RoleId, Seat>>> = {
  // As in the reference photo: CMO top-left, Funding Finder top-right, Strategist centre.
  ideation: { cmo: { x: 24, y: 24 }, ff: { x: 76, y: 24 }, strategist: { x: 50, y: 66 } },
  mvp: { cmo: { x: 17, y: 28 }, cfo: { x: 50, y: 17 }, ff: { x: 83, y: 28 }, strategist: { x: 50, y: 70 } },
  // A half-circle of five around the Strategist.
  "early-traction": {
    ceo: { x: 12, y: 58 },
    cfo: { x: 25, y: 24 },
    coo: { x: 50, y: 13 },
    cmo: { x: 75, y: 24 },
    cco: { x: 88, y: 58 },
    strategist: { x: 50, y: 70 },
  },
  // A board table: the Strategist at the head, specialists along the sides.
  scaling: {
    strategist: { x: 11, y: 50 },
    ceo: { x: 37, y: 15 },
    cfo: { x: 64, y: 15 },
    coo: { x: 37, y: 85 },
    cmo: { x: 64, y: 85 },
    cco: { x: 89, y: 50 },
  },
};

export function BoardStage({
  stage,
  statuses,
  scale = 1,
  className,
}: {
  stage: StageId;
  statuses?: Partial<Record<RoleId, AgentStatus>>;
  scale?: number;
  className?: string;
}) {
  const info = stageById(stage);
  const roles: RoleId[] = ["strategist", ...info.specialists];
  const layout = LAYOUTS[stage];
  return (
    <div className={clsx("relative w-full", className)} style={{ height: 360 * scale }}>
      {stage === "scaling" && (
        <div
          className="absolute rounded-[999px] border border-line bg-sunken/70"
          style={{ left: "21%", right: "21%", top: "36%", bottom: "36%" }}
          aria-hidden
        />
      )}
      {stage !== "scaling" && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {info.specialists.map((r) => {
            const a = layout[r]!;
            const s = layout.strategist!;
            return (
              <line
                key={r}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${s.x}%`}
                y2={`${s.y}%`}
                stroke="#d9d6ce"
                strokeWidth="1.25"
                strokeDasharray="3 5"
              />
            );
          })}
        </svg>
      )}
      {roles.map((role) => {
        const seat = layout[role]!;
        const lead = role === "strategist";
        const status = statuses?.[role];
        return (
          <div
            key={role}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
            style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
          >
            <div className={clsx("rounded-full bg-paper", lead && "ring-1 ring-line")}>
              <Mascot role={role} stage={stage} size={(lead ? 92 : 68) * scale} dim={status === "skipped"} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className={clsx("whitespace-nowrap font-semibold text-ink", scale < 0.8 ? "text-[11px]" : "text-[13px]")}>
                {ROLES[role].name}
              </span>
              {status ? (
                <StatusTag status={status} />
              ) : (
                scale >= 0.8 && (
                  <span className="max-w-[140px] text-[11px] leading-snug text-muted">
                    {lead ? "Coordinates the board" : ROLES[role].focus}
                  </span>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Compact one-row version used above the chat on small screens. */
export function BoardStrip({
  stage,
  statuses,
}: {
  stage: StageId;
  statuses?: Partial<Record<RoleId, AgentStatus>>;
}) {
  const info = stageById(stage);
  const roles: RoleId[] = ["strategist", ...info.specialists];
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {roles.map((role) => (
        <div key={role} className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3">
          <Mascot role={role} stage={stage} size={30} dim={statuses?.[role] === "skipped"} />
          <span className="text-xs font-semibold text-ink">{ROLES[role].short}</span>
          {statuses?.[role] && <StatusTag status={statuses[role]!} />}
        </div>
      ))}
    </div>
  );
}
