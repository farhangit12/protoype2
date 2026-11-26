"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Mic, Square, Upload, X } from "lucide-react";
import type { Attachment, StageId } from "@/lib/types";

/* Prototype only: uploads and voice are simulated. Files are never read and no audio is recorded. */

type Phase = "uploading" | "processing" | "ready";
interface PendingFile extends Attachment {
  id: string;
  progress: number;
  phase: Phase;
}

const SAMPLE_TRANSCRIPT: Record<StageId, string> = {
  ideation:
    "I want to check if there is real demand for my idea, and which grants or government schemes a student founder like me can apply for.",
  mvp: "We have a basic version ready. How should we price it for our first users, and how do we know if it is working?",
  "early-traction":
    "We have our first paying customers. Should we hire two more people now or wait until revenue is steady?",
  scaling:
    "We want to expand to two new cities next quarter. Is that a good idea with our current team and budget?",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function Composer({
  stage,
  disabled,
  onSubmit,
}: {
  stage: StageId;
  disabled: boolean;
  onSubmit: (text: string, attachments: Attachment[]) => void;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [sampleShown, setSampleShown] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  // Simulated upload progress, then processing, then ready.
  useEffect(() => {
    if (!files.some((f) => f.phase !== "ready")) return;
    const t = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.phase === "uploading") {
            const progress = Math.min(100, f.progress + 9 + Math.random() * 14);
            return progress >= 100 ? { ...f, progress: 100, phase: "processing" } : { ...f, progress };
          }
          if (f.phase === "processing" && Math.random() < 0.35) return { ...f, phase: "ready" };
          return f;
        }),
      );
    }, 180);
    return () => clearInterval(t);
  }, [files]);

  // Simulated recording timer.
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  function pickFiles(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list)
      .slice(0, 5)
      .map((f) => ({
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        size: f.size,
        progress: 0,
        phase: "uploading" as Phase,
      }));
    setFiles((prev) => [...prev, ...added].slice(0, 5));
  }

  function stopRecording() {
    setRecording(false);
    setTranscribing(true);
    setTimeout(() => {
      setTranscribing(false);
      setText((t) => (t.trim() ? `${t.trim()} ${SAMPLE_TRANSCRIPT[stage]}` : SAMPLE_TRANSCRIPT[stage]));
      setSampleShown(true);
      area.current?.focus();
    }, 1100);
  }

  const busyFiles = files.some((f) => f.phase !== "ready");
  const canSend = !disabled && !recording && !transcribing && !busyFiles && text.trim().length > 0;

  function submit() {
    if (!canSend) return;
    onSubmit(text.trim(), files.map(({ name, size }) => ({ name, size })));
    setText("");
    setFiles([]);
    setSampleShown(false);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-[var(--shadow-lift)]">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-line px-3 pt-3 pb-3">
          {files.map((f) => (
            <div key={f.id} className="flex w-[220px] items-center gap-2.5 rounded-xl border border-line bg-paper px-2.5 py-2">
              <FileText className="h-4 w-4 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-ink">{f.name}</div>
                {f.phase === "uploading" && (
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${f.progress}%` }} />
                  </div>
                )}
                {f.phase === "processing" && (
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-accent">
                    <Loader2 className="h-3 w-3 animate-spin" /> Processing…
                  </div>
                )}
                {f.phase === "ready" && <div className="mt-0.5 text-[11px] text-muted">{formatSize(f.size)} · Ready</div>}
              </div>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))}
                className="rounded-md p-1 text-faint hover:bg-line/60 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <p className="w-full text-[11px] text-faint">Simulated upload: file contents aren&rsquo;t read in this prototype.</p>
        </div>
      )}

      {recording || transcribing ? (
        <div className="flex items-center gap-4 px-4 py-5">
          <span className="relative flex h-3 w-3">
            {recording && <span className="absolute inline-flex h-full w-full rounded-full bg-bad/50 animate-soft-pulse" />}
            <span className={clsx("relative inline-flex h-3 w-3 rounded-full", recording ? "bg-bad" : "bg-faint")} />
          </span>
          <div className="flex h-8 flex-1 items-center gap-[3px]" aria-hidden>
            {Array.from({ length: 36 }).map((_, i) => (
              <span
                key={i}
                className={clsx("w-[3px] rounded-full bg-ink/70", recording && "animate-bar-wave")}
                style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${(i % 9) * 0.09}s`, opacity: recording ? 1 : 0.3 }}
              />
            ))}
          </div>
          <span className="w-12 text-right text-sm tabular-nums text-muted">
            {transcribing ? "" : `0:${String(seconds).padStart(2, "0")}`}
          </span>
          {recording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white"
            >
              <Square className="h-3 w-3 fill-current" /> Stop
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Transcribing…
            </span>
          )}
        </div>
      ) : (
        <div className="px-4 pt-3">
          {sampleShown && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
              <Mic className="h-3 w-3" /> Sample transcript (simulated). Edit it before sending.
            </div>
          )}
          <textarea
            ref={area}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Ask your board a question…"
            className="block max-h-[200px] min-h-[28px] w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-faint"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-2">
        <div className="flex items-center gap-1">
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
            onChange={(e) => {
              pickFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <ToolButton label="Attach documents" onClick={() => fileInput.current?.click()} disabled={recording || transcribing}>
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
          </ToolButton>
          <ToolButton
            label="Voice input"
            onClick={() => {
              setSeconds(0);
              setRecording(true);
            }}
            disabled={recording || transcribing}
          >
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voice</span>
          </ToolButton>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-2 disabled:bg-ink/25"
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Submit Query
        </button>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-ink-2 transition-colors hover:bg-sunken disabled:opacity-40"
    >
      {children}
    </button>
  );
}
