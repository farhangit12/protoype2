import { stageById } from "@/lib/stages";
import type { StageId } from "@/lib/types";
import { Mascot } from "./mascot";

/** A small overlapping row of the stage's board: specialists then the Strategist. */
export function BoardPreview({ stage, size = 30 }: { stage: StageId; size?: number }) {
  const s = stageById(stage);
  return (
    <div className="flex items-center">
      {["strategist" as const, ...s.specialists].map((role, i) => (
        <span
          key={role}
          className="rounded-full bg-surface ring-2 ring-surface"
          style={{ marginLeft: i === 0 ? 0 : -size * 0.28 }}
        >
          <Mascot role={role} stage={stage} size={size} />
        </span>
      ))}
    </div>
  );
}
