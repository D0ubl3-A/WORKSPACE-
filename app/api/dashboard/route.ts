import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type Project = { id: string; name: string; client: string; status: string; owner: string };
type Task = { id: string; title: string; project: string; status: string; due: string; owner: string };
type Note = { id: string; title: string; content: string; reference: string };

type DashboardState = {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
};

const STATE_PATH = path.join(process.cwd(), "workspace", "dashboard-state.json");

const seedState: DashboardState = {
  projects: [
    { id: "p-001", name: "Storefront polish", client: "Internal", status: "Active", owner: "iLL" },
    { id: "p-002", name: "Holiday drop", client: "Brand", status: "Planned", owner: "Cody" },
  ],
  tasks: [
    { id: "t-001", title: "Ship hero banner", project: "Storefront polish", status: "Doing", due: "2025-12-24", owner: "iLL" },
    { id: "t-002", title: "QA checkout", project: "Holiday drop", status: "Todo", due: "2025-12-26", owner: "Bill" },
    { id: "t-003", title: "Catalog sync", project: "Storefront polish", status: "Blocked", due: "2025-12-23", owner: "Ad" },
  ],
  notes: [
    { id: "n-001", title: "KPIs", content: "AOV target 80, CVR 4.5%", reference: "deck" },
    { id: "n-002", title: "Risks", content: "Checkout flakiness on Safari", reference: "qa" },
  ],
};

async function ensureDir() {
  await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
}

async function readState(): Promise<DashboardState> {
  try {
    const raw = await fs.readFile(STATE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : seedState.projects,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : seedState.tasks,
      notes: Array.isArray(parsed.notes) ? parsed.notes : seedState.notes,
    };
  } catch {
    return seedState;
  }
}

async function writeState(state: DashboardState) {
  await ensureDir();
  await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
}

export async function GET() {
  const state = await readState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DashboardState>;
    const current = await readState();
    const next: DashboardState = {
      projects: Array.isArray(body.projects) ? body.projects : current.projects,
      tasks: Array.isArray(body.tasks) ? body.tasks : current.tasks,
      notes: Array.isArray(body.notes) ? body.notes : current.notes,
    };
    await writeState(next);
    return NextResponse.json(next);
  } catch (error) {
    console.error("dashboard POST error", error);
    return NextResponse.json({ error: "Failed to persist dashboard state." }, { status: 500 });
  }
}
