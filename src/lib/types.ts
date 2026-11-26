export type StageId = "ideation" | "mvp" | "early-traction" | "scaling";

export type RoleId = "strategist" | "cmo" | "ff" | "cfo" | "ceo" | "coo" | "cco";

export type AgentStatus = "waiting" | "working" | "completed" | "skipped";

export type Verdict = "viable" | "conditional" | "not_workable" | "info";

export interface Business {
  id: string;
  name: string;
  industry: string;
  size: string;
  employees: number;
  stage: StageId;
  createdAt: number;
}

export interface BoardEntry {
  role: RoleId;
  status: AgentStatus;
  task?: string;
}

export interface Attachment {
  name: string;
  size: number;
}

export interface Message {
  id: string;
  role: "founder" | "strategist";
  content: string;
  createdAt: number;
  verdict?: Verdict;
  board?: BoardEntry[];
  attachments?: Attachment[];
  error?: boolean;
}

export interface Session {
  id: string;
  businessId: string;
  title: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface StoreData {
  businesses: Business[];
  sessions: Session[];
}

/** Events streamed by /api/boardroom, one JSON object per line. */
export type BoardEvent =
  | { type: "plan"; tasks: { role: RoleId; task: string }[]; skipped: RoleId[] }
  | { type: "status"; role: RoleId; status: "working" | "completed" }
  | { type: "final"; verdict: Verdict; answer: string }
  | { type: "error"; message: string };
