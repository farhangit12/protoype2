import type { Message } from "./types";

export function newId(prefix: string): string {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

/** A new chat message with a fresh id and timestamp. */
export function makeMessage(fields: Omit<Message, "id" | "createdAt">): Message {
  return { id: newId("msg"), createdAt: Date.now(), ...fields };
}
