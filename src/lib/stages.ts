import type { RoleId, StageId } from "./types";

export interface RoleInfo {
  id: RoleId;
  name: string;
  short: string;
  focus: string;
}

export const ROLES: Record<RoleId, RoleInfo> = {
  strategist: {
    id: "strategist",
    name: "Strategist",
    short: "ST",
    focus: "Coordinates the board and delivers the final answer",
  },
  cmo: { id: "cmo", name: "CMO", short: "CMO", focus: "Market and marketing research" },
  ff: {
    id: "ff",
    name: "Funding Finder",
    short: "FF",
    focus: "Funding, eligibility, government schemes and hackathons",
  },
  cfo: { id: "cfo", name: "CFO", short: "CFO", focus: "Pricing, unit economics and runway" },
  ceo: { id: "ceo", name: "CEO", short: "CEO", focus: "Vision, priorities and team" },
  coo: { id: "coo", name: "COO", short: "COO", focus: "Operations, processes and delivery" },
  cco: { id: "cco", name: "CCO", short: "CCO", focus: "Compliance and legal risk" },
};

export interface StageInfo {
  id: StageId;
  number: number;
  label: string;
  blurb: string;
  /** Specialists on this stage's board. The Strategist is always present on top of these. */
  specialists: RoleId[];
}

export const STAGES: StageInfo[] = [
  {
    id: "ideation",
    number: 1,
    label: "Ideation",
    blurb: "Shaping the idea and checking the market",
    specialists: ["cmo", "ff"],
  },
  {
    id: "mvp",
    number: 2,
    label: "MVP",
    blurb: "Building the first version and testing it",
    specialists: ["cmo", "cfo", "ff"],
  },
  {
    id: "early-traction",
    number: 3,
    label: "Early Traction",
    blurb: "First paying customers and repeatable growth",
    specialists: ["ceo", "cfo", "coo", "cmo", "cco"],
  },
  {
    id: "scaling",
    number: 4,
    label: "Scaling",
    blurb: "Growing the team, markets and operations",
    specialists: ["ceo", "cfo", "coo", "cmo", "cco"],
  },
];

export function stageById(id: StageId): StageInfo {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown stage ${id}`);
  return stage;
}

export const INDUSTRIES = [
  "Agritech",
  "D2C / Consumer brands",
  "Edtech",
  "Fintech",
  "Food & beverage",
  "Healthtech",
  "SaaS / Software",
  "Social impact",
  "Other",
];

export const BUSINESS_SIZES = ["Solo founder", "Micro", "Small", "Medium"];
