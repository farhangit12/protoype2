"use client";

/**
 * Per-user data saved in the browser (localStorage), keyed by the Clerk user id.
 * Prototype only: data stays on this device and browser.
 */
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { newId } from "./id";
import type { Business, Message, Session, StageId, StoreData } from "./types";

const EMPTY: StoreData = { businesses: [], sessions: [] };
const cache = new Map<string, StoreData>();
const listeners = new Set<() => void>();

const keyFor = (userId: string) => `disha:v1:${userId}`;

function read(userId: string): StoreData {
  const hit = cache.get(userId);
  if (hit) return hit;
  let data = EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    if (raw) data = { ...EMPTY, ...(JSON.parse(raw) as StoreData) };
  } catch {
    data = EMPTY;
  }
  cache.set(userId, data);
  return data;
}

function write(userId: string, next: StoreData) {
  cache.set(userId, next);
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(next));
  } catch {
    /* storage full or blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("disha:v1:")) {
      cache.clear();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDisha(userId: string | null | undefined) {
  const data = useSyncExternalStore(
    subscribe,
    () => (userId ? read(userId) : null),
    () => null,
  );

  const update = useCallback(
    (fn: (d: StoreData) => StoreData) => {
      if (!userId) return;
      write(userId, fn(read(userId)));
    },
    [userId],
  );

  const actions = useMemo(
    () => ({
      createBusiness(input: Omit<Business, "id" | "createdAt">): Business {
        const business: Business = { ...input, id: newId("biz"), createdAt: Date.now() };
        update((d) => ({ ...d, businesses: [business, ...d.businesses] }));
        return business;
      },
      createSession(businessId: string): Session {
        const now = Date.now();
        const session: Session = {
          id: newId("ses"),
          businessId,
          title: "New session",
          pinned: false,
          createdAt: now,
          updatedAt: now,
          messages: [],
        };
        update((d) => ({ ...d, sessions: [session, ...d.sessions] }));
        return session;
      },
      addMessage(sessionId: string, message: Message) {
        update((d) => ({
          ...d,
          sessions: d.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const isFirst = s.messages.length === 0 && message.role === "founder";
            return {
              ...s,
              title: isFirst ? titleFrom(message.content) : s.title,
              updatedAt: Date.now(),
              messages: [...s.messages, message],
            };
          }),
        }));
      },
      togglePin(sessionId: string) {
        update((d) => ({
          ...d,
          sessions: d.sessions.map((s) => (s.id === sessionId ? { ...s, pinned: !s.pinned } : s)),
        }));
      },
      deleteSession(sessionId: string) {
        update((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== sessionId) }));
      },
    }),
    [update],
  );

  return { data, ready: data !== null, ...actions };
}

function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 52 ? `${clean.slice(0, 50).trimEnd()}…` : clean || "New session";
}

export function stageOf(data: StoreData | null, businessId: string): StageId | null {
  return data?.businesses.find((b) => b.id === businessId)?.stage ?? null;
}
