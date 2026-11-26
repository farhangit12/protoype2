import { auth } from "@clerk/nextjs/server";
import { clerkEnabled } from "@/lib/auth-mode";
import { finalPrompt, planPrompt, specialistPrompt, type BusinessContext } from "@/lib/board-prompts";
import { GroqError, MODELS, groqChat, parseJsonObject, type ChatMessage } from "@/lib/groq";
import { STAGES } from "@/lib/stages";
import type { BoardEvent, RoleId, Verdict } from "@/lib/types";

export const maxDuration = 60; // seconds; within Vercel's function limits

interface Body {
  business: BusinessContext;
  query: string;
  history?: { role: "founder" | "strategist"; content: string }[];
  attachments?: string[];
}

const VERDICTS: Verdict[] = ["viable", "conditional", "not_workable", "info"];

function validate(body: unknown): Body | string {
  const b = body as Body;
  if (!b || typeof b.query !== "string" || !b.query.trim()) return "Query is empty.";
  if (b.query.length > 4000) return "Query is too long (4,000 characters max).";
  const biz = b.business;
  if (!biz || typeof biz.name !== "string" || !STAGES.some((s) => s.id === biz.stage)) {
    return "Business or stage is missing.";
  }
  return b;
}

export async function POST(req: Request) {
  if (clerkEnabled) {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  const parsed = validate(await req.json().catch(() => null));
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });
  const { business, query } = parsed;
  const stage = STAGES.find((s) => s.id === business.stage)!;

  const history: ChatMessage[] = (parsed.history ?? []).slice(-6).map((m) => ({
    role: m.role === "founder" ? "user" : "assistant",
    content: m.content.slice(0, 1500),
  }));
  const files = (parsed.attachments ?? []).slice(0, 5);
  const founderText = files.length
    ? `${query}\n\n(Founder attached: ${files.join(", ")}. File contents are not read in this prototype.)`
    : query;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: BoardEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        // 1-4. Strategist receives the query and picks specialists.
        const planRaw = await groqChat({
          model: MODELS.strategist,
          json: true,
          maxTokens: 400,
          messages: [{ role: "system", content: planPrompt(business) }, ...history, { role: "user", content: founderText }],
          signal: req.signal,
        });
        const plan = parseJsonObject<{ specialists?: { role?: string; task?: string }[] }>(planRaw);
        const tasks = (plan?.specialists ?? [])
          .filter((s): s is { role: RoleId; task: string } =>
            stage.specialists.includes(s.role as RoleId) && typeof s.task === "string" && s.task.length > 0,
          )
          .filter((s, i, all) => all.findIndex((x) => x.role === s.role) === i);
        const skipped = stage.specialists.filter((r) => !tasks.some((t) => t.role === r));
        send({ type: "plan", tasks, skipped });

        // 5-6. Specialists analyse in parallel; each status is streamed as it changes.
        const findings = await Promise.all(
          tasks.map(async (t) => {
            send({ type: "status", role: t.role, status: "working" });
            const text = await groqChat({
              model: MODELS.specialist,
              maxTokens: 350,
              messages: [
                { role: "system", content: specialistPrompt(t.role, business) },
                { role: "user", content: `Founder's message: ${founderText}\n\nYour task from the Strategist: ${t.task}` },
              ],
              signal: req.signal,
            });
            send({ type: "status", role: t.role, status: "completed" });
            return { role: t.role, task: t.task, text };
          }),
        );

        // 7-8. Strategist reviews and writes one consolidated answer.
        const notes = findings.length
          ? findings.map((f) => `### ${f.role.toUpperCase()} (task: ${f.task})\n${f.text}`).join("\n\n")
          : "No specialists were needed for this message.";
        const finalRaw = await groqChat({
          model: MODELS.strategist,
          json: true,
          maxTokens: 900,
          messages: [
            { role: "system", content: finalPrompt(business) },
            ...history,
            { role: "user", content: `Founder's message: ${founderText}\n\nInternal findings from your specialists:\n${notes}` },
          ],
          signal: req.signal,
        });
        const final = parseJsonObject<{ verdict?: string; answer?: string }>(finalRaw);
        const verdict = VERDICTS.includes(final?.verdict as Verdict) ? (final!.verdict as Verdict) : "info";
        const answer = final?.answer?.trim() || finalRaw.trim() || "The board could not produce an answer. Please try again.";
        send({ type: "final", verdict, answer });
      } catch (err) {
        const message =
          err instanceof GroqError ? err.message : "Something went wrong while the board was working. Please try again.";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
