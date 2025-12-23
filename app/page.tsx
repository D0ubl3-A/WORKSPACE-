
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Project = { id: string; name: string; client: string; status: string; owner: string };
type Task = { id: string; title: string; project: string; status: string; due: string; owner: string };
type Note = { id: string; title: string; content: string; reference: string };
type Agent = { id: string; name: string; role: string; status: string; poweredBy: string };
type Workstation = { id: string; title: string; instruction: string; code: string; createdAt: string };
type Widget = { id: string; type: "dropdown" | "button" | "panel" | "input"; label: string; menu?: string[]; action?: string };
type Prompt = { id: string; label: string; text: string };
type Client = {
  id: string;
  name: string;
  status: "Lead" | "Qualified" | "Proposal" | "Negotiation" | "In progress" | "Lost" | "Closed";
  priority: "Low" | "Medium" | "High";
  accountOwner: string;
  company: string;
  primaryContact: string;
  email: string;
  phone: string;
  website: string;
  timezone: string;
  contactMethod: "email" | "phone" | "text" | "WhatsApp" | "other";
  source: "Referral" | "social media" | "event" | "ad" | "other";
  referrer: string;
  estimatedValue: number;
  expectedClose: string;
  lastContact: string;
};
type Meeting = {
  id: string;
  name: string;
  clientId: string;
  date: string;
  location: string;
  organizer: string;
  type: "Online-Conference" | "Lunch" | "Meeting" | "Call";
};
type GithubProject = {
  id: string;
  project: string;
  status: "Backlog" | "In Progress" | "Blocked" | "Done";
  category: string;
  owner: string;
  repoUrl: string;
  description: string;
  keyFeatures: string;
  completion: string;
  lastUpdated: string;
  mirror: boolean;
};
type SoraPromptTab = { id: string; name: string; link: string; order: number };
type NoteEntry = {
  id: string;
  name: string;
  status: "Inbox" | "To Review" | "Final";
  created: string;
  edited: string;
  notebookId?: string;
  favorite: boolean;
  pin: boolean;
  archive: boolean;
};
type Notebook = {
  id: string;
  name: string;
  edited: string;
  archive: boolean;
};
type PayrollRun = {
  id: string;
  runName: string;
  type: "Project Based" | "Hourly" | "Fixed";
  periodStart: string;
  periodEnd: string;
  rate: number;
  weeklyHours: number;
  tasksCompleted: number;
  bonuses: number;
  deductions: number;
  overrideAmount: number;
  bankName: string;
  accountNumber: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  createdAt: string;
};
type FundraisingEntry = {
  id: string;
  name: string;
  status: "Contacted" | "Pitched" | "Diligence" | "Won" | "Lost";
  description: string;
  avgCheckSize: number;
  capitalCommitted: number;
  partnerName: string;
  partnerEmail: string;
  firmLinkedIn: string;
  portfolio: string;
  warmContactName: string;
  warmContactEmail: string;
  lostReason: string;
};
type CategoryEntry = { id: string; name: string; spentMonth: number; spentTotal: number };
type PlatformCost = {
  id: string;
  tool: string;
  vendor: string;
  usedFor: string[];
  costModel: string[];
  billingUnit: string;
  subscriptionPrice: number;
  creditsPackPrice: number;
  usagePrice: string;
  renewalDate: string;
  active: boolean;
  adminUrl: string;
  notes: string;
};
type StoryClip = {
  id: string;
  name: string;
  mediaUrl: string;
  start: number;
  end: number;
  solo: boolean;
};
type StoryTransition = { id: string; fromId: string; toId: string; type: string; duration: number };
type StoryboardShot = {
  id: string;
  name: string;
  beat: string;
  duration: string;
  camera: string;
  transition: string;
  mood?: string;
};
type ChatTurn = { role: "user" | "assistant"; content: string };
const makeChatTurn = (role: ChatTurn["role"], content: string): ChatTurn => ({ role, content });
type NotificationEntry = { id: string; ts: string; target: string; message: string };
type CoderStep = { id: string; title: string; detail: string };
type IdeFile = { path: string; type: "file" | "folder"; language?: string; size?: string };
type SunoTrack = {
  id?: string;
  title?: string;
  audio_url?: string;
  image_url?: string;
  duration?: number;
  tags?: string;
  stream_audio_url?: string;
  source_audio_url?: string;
};
type DashboardState = { projects: Project[]; tasks: Task[]; notes: Note[] };
type LogEntry = { ts: string; source: string; level: "info" | "error"; message: string };
type ProjectSave = {
  id: string;
  project: string;
  section: string;
  title: string;
  content: string;
  createdAt: string;
  meta?: Record<string, string>;
};

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

const sampleProjects: Project[] = [
  { id: "p-001", name: "DTC Webstore Refresh", client: "Auraline Beauty", status: "In progress", owner: "Ava" },
  { id: "p-002", name: "Groq Ops Dashboard", client: "Internal", status: "Backlog", owner: "Cody" },
  { id: "p-003", name: "Content Pipeline Upgrade", client: "Nova Studios", status: "Planned", owner: "Ad" },
];
const sampleTasks: Task[] = [
  { id: "t-001", title: "Ship PDP A/B test", project: "DTC Webstore Refresh", status: "Doing", due: "2025-01-22", owner: "Ava" },
  { id: "t-002", title: "Wire admin metrics", project: "Groq Ops Dashboard", status: "Todo", due: "2025-01-18", owner: "" },
  { id: "t-003", title: "Draft content schema v2", project: "Content Pipeline Upgrade", status: "Doing", due: "2025-01-25", owner: "" },
];
const sampleNotes: Note[] = [
  {
    id: "n-001",
    title: "Auraline feedback",
    content: "Homepage hero needs stronger social proof and faster LCP; move UGC row above fold.",
    reference: "DTC Webstore Refresh",
  },
  {
    id: "n-002",
    title: "Ops metrics",
    content: "Top asks: job queue latency, error budget burn-down, model spend by workspace.",
    reference: "Groq Ops Dashboard",
  },
];
const sampleAgents: Agent[] = [
  { id: "a-001", name: "iLL", role: "Founder", status: "Online", poweredBy: "Groq Architect" },
  { id: "a-002", name: "Cody", role: "Engineer", status: "Online", poweredBy: "O-Coding (Groq)" },
  { id: "a-003", name: "Ad", role: "Ops", status: "Busy", poweredBy: "Groq Planner" },
  { id: "a-004", name: "Mcdaniel", role: "PM", status: "Idle", poweredBy: "Groq Assistant" },
  { id: "a-005", name: "Bill", role: "QA", status: "Idle", poweredBy: "Groq Assistant" },
  { id: "a-006", name: "Nova", role: "Agent Builder", status: "Online", poweredBy: "Groq Compound" },
];
const sampleClients: Client[] = [
  {
    id: "cli-001",
    name: "Auraline Beauty",
    status: "Negotiation",
    priority: "High",
    accountOwner: "Ava",
    company: "Auraline",
    primaryContact: "Taylor Reed",
    email: "taylor@auraline.com",
    phone: "+1-323-555-0183",
    website: "https://auraline.com",
    timezone: "PST",
    contactMethod: "email",
    source: "Referral",
    referrer: "Studio Nova",
    estimatedValue: 125000,
    expectedClose: "2025-02-10",
    lastContact: "2025-01-05",
  },
  {
    id: "cli-002",
    name: "Nova Studios",
    status: "Proposal",
    priority: "Medium",
    accountOwner: "Ad",
    company: "Nova",
    primaryContact: "Priya Chen",
    email: "priya@novastudios.io",
    phone: "+1-415-555-0112",
    website: "https://novastudios.io",
    timezone: "PST",
    contactMethod: "email",
    source: "event",
    referrer: "",
    estimatedValue: 78000,
    expectedClose: "2025-01-28",
    lastContact: "2025-01-04",
  },
];
const sampleMeetings: Meeting[] = [
  { id: "mtg-001", name: "Auraline weekly", clientId: "cli-001", date: "2025-01-12", location: "Zoom", organizer: "Ava", type: "Online-Conference" },
  { id: "mtg-002", name: "Nova schema review", clientId: "cli-002", date: "2025-01-15", location: "Zoom", organizer: "Ad", type: "Meeting" },
];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [agents, setAgents] = useState<Agent[]>(sampleAgents);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [newProjectOwner, setNewProjectOwner] = useState("Ava");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteReference, setNewNoteReference] = useState("");
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("");
  const [activeAgentId, setActiveAgentId] = useState(sampleAgents[0]?.id ?? "");
  const [workstationTitle, setWorkstationTitle] = useState("");
  const [workstationInstruction, setWorkstationInstruction] = useState("");
  const [workstations, setWorkstations] = useState<Record<string, Workstation[]>>(() =>
    sampleAgents.reduce((acc, agent) => {
      acc[agent.id] = [];
      return acc;
    }, {} as Record<string, Workstation[]>),
  );
  const [workspaceWidgets, setWorkspaceWidgets] = useState<Record<string, Widget[]>>(() =>
    sampleAgents.reduce((acc, agent) => {
      acc[agent.id] = [];
      return acc;
    }, {} as Record<string, Widget[]>),
  );
  const [widgetLabel, setWidgetLabel] = useState("");
  const [widgetType, setWidgetType] = useState<Widget["type"]>("dropdown");
  const [widgetMenu, setWidgetMenu] = useState("General,Context,Persona");
  const [widgetAction, setWidgetAction] = useState("Send");
  const [promptLibrary, setPromptLibrary] = useState<Prompt[]>([
    { id: "pr-001", label: "Status check", text: "Summarize current task statuses and flag blockers." },
    { id: "pr-002", label: "Creative brief", text: "Generate a short creative brief for the Matt T video." },
    { id: "pr-003", label: "Client update", text: "Draft a client update with milestones, risks, and next steps." },
  ]);
  const [newPromptLabel, setNewPromptLabel] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [apiDocs, setApiDocs] = useState<{ id: string; title: string; url: string; description: string }[]>([
    { id: "doc-1", title: "Groq API", url: "https://docs.groq.com", description: "Use for querying models and workspaces." },
    { id: "doc-2", title: "Next.js App Router", url: "https://nextjs.org/docs/app", description: "Understand routes and layouts." },
    { id: "doc-3", title: "Prisma Docs", url: "https://www.prisma.io/docs", description: "Review schema and seed instructions." },
  ]);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocDescription, setNewDocDescription] = useState("");
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [newClientName, setNewClientName] = useState("");
  const [newClientStatus, setNewClientStatus] = useState<Client["status"]>("Lead");
  const [newClientPriority, setNewClientPriority] = useState<Client["priority"]>("Medium");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientExpectedClose, setNewClientExpectedClose] = useState("");
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const [meetingName, setMeetingName] = useState("");
  const [meetingClientId, setMeetingClientId] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingType, setMeetingType] = useState<Meeting["type"]>("Meeting");
  const [githubProjects, setGithubProjects] = useState<GithubProject[]>([]);
  const [ghName, setGhName] = useState("");
  const [ghStatus, setGhStatus] = useState<GithubProject["status"]>("Backlog");
  const [ghCategory, setGhCategory] = useState("App");
  const [ghRepoUrl, setGhRepoUrl] = useState("");
  const [ghOwner, setGhOwner] = useState("");
  const [soraTabs, setSoraTabs] = useState<SoraPromptTab[]>([]);
  const [soraName, setSoraName] = useState("");
  const [soraLink, setSoraLink] = useState("");
  const [soraOrder, setSoraOrder] = useState<number>(1);
  const [noteEntries, setNoteEntries] = useState<NoteEntry[]>([]);
  const [noteEntryName, setNoteEntryName] = useState("");
  const [noteEntryStatus, setNoteEntryStatus] = useState<NoteEntry["status"]>("Inbox");
  const [noteEntryNotebookId, setNoteEntryNotebookId] = useState<string>("");
  const [noteEntryFavorite, setNoteEntryFavorite] = useState(false);
  const [noteEntryPin, setNoteEntryPin] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notebookName, setNotebookName] = useState("");
  const [notebookArchive, setNotebookArchive] = useState(false);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [payrollName, setPayrollName] = useState("");
  const [payrollType, setPayrollType] = useState<PayrollRun["type"]>("Hourly");
  const [payrollStart, setPayrollStart] = useState("");
  const [payrollEnd, setPayrollEnd] = useState("");
  const [payrollRate, setPayrollRate] = useState<number>(0);
  const [payrollWeeklyHours, setPayrollWeeklyHours] = useState<number>(40);
  const [payrollTasks, setPayrollTasks] = useState<number>(0);
  const [payrollBonuses, setPayrollBonuses] = useState<number>(0);
  const [payrollDeductions, setPayrollDeductions] = useState<number>(0);
  const [payrollOverrideAmount, setPayrollOverrideAmount] = useState<number>(0);
  const [payrollBankName, setPayrollBankName] = useState("");
  const [payrollAccountNumber, setPayrollAccountNumber] = useState("");
  const [payrollCountry, setPayrollCountry] = useState("");
  const [payrollCity, setPayrollCity] = useState("");
  const [payrollAddress, setPayrollAddress] = useState("");
  const [payrollPostalCode, setPayrollPostalCode] = useState("");
  const [fundraisingEntries, setFundraisingEntries] = useState<FundraisingEntry[]>([]);
  const [fundName, setFundName] = useState("");
  const [fundStatus, setFundStatus] = useState<FundraisingEntry["status"]>("Contacted");
  const [fundAvgCheck, setFundAvgCheck] = useState<number>(0);
  const [fundCapital, setFundCapital] = useState<number>(0);
  const [fundPartnerName, setFundPartnerName] = useState("");
  const [fundPartnerEmail, setFundPartnerEmail] = useState("");
  const [fundWarmName, setFundWarmName] = useState("");
  const [fundWarmEmail, setFundWarmEmail] = useState("");
  const [fundDescription, setFundDescription] = useState("");
  const [fundLostReason, setFundLostReason] = useState("");
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [platformCosts, setPlatformCosts] = useState<PlatformCost[]>([]);
  const [platformTool, setPlatformTool] = useState("");
  const [platformVendor, setPlatformVendor] = useState("Other");
  const [platformUsedFor, setPlatformUsedFor] = useState<string>("Chat");
  const [platformCostModel, setPlatformCostModel] = useState<string>("Subscription");
  const [platformBillingUnit, setPlatformBillingUnit] = useState<string>("Month");
  const [platformSubscription, setPlatformSubscription] = useState<number>(0);
  const [platformCredits, setPlatformCredits] = useState<number>(0);
  const [platformUsagePrice, setPlatformUsagePrice] = useState<string>("");
  const [platformRenewal, setPlatformRenewal] = useState<string>("");
  const [platformActive, setPlatformActive] = useState<boolean>(true);
  const [platformAdminUrl, setPlatformAdminUrl] = useState<string>("");
  const [platformNotes, setPlatformNotes] = useState<string>("");
  const [storyAudioUrl, setStoryAudioUrl] = useState("");
  const [storyClipName, setStoryClipName] = useState("");
  const [storyClipUrl, setStoryClipUrl] = useState("");
  const [storyClipStart, setStoryClipStart] = useState<number>(0);
  const [storyClipEnd, setStoryClipEnd] = useState<number>(0);
  const [storyClips, setStoryClips] = useState<StoryClip[]>([]);
  const [storyTransitions, setStoryTransitions] = useState<StoryTransition[]>([]);
  const [transitionFrom, setTransitionFrom] = useState("");
  const [transitionTo, setTransitionTo] = useState("");
  const [transitionType, setTransitionType] = useState("Crossfade");
  const [transitionDuration, setTransitionDuration] = useState<number>(1);
  const [transitionPresetKey, setTransitionPresetKey] = useState<string>("Crossfade");
  const [previewClipUrl, setPreviewClipUrl] = useState("");
  const [storyboardPrompt, setStoryboardPrompt] = useState(
    "Create a 6-shot storyboard for a 30-second music video. Include shot names, durations, camera moves, and suggested transitions.",
  );
  const [storyboardOutput, setStoryboardOutput] = useState("");
  const [storyboardRunning, setStoryboardRunning] = useState(false);
  const [storyboardShots, setStoryboardShots] = useState<StoryboardShot[]>([]);
  const [storyboardNotes, setStoryboardNotes] = useState("");
  const [maverickPrompt, setMaverickPrompt] = useState("Tighten all clips to 0.5s and solo the best intro shot.");
  const [maverickOutput, setMaverickOutput] = useState("");
  const [maverickRunning, setMaverickRunning] = useState(false);
  const [toolPrompt, setToolPrompt] = useState("Summarize task statuses with interruptible steps.");
  const [toolOutput, setToolOutput] = useState<string>("");
  const [toolRunning, setToolRunning] = useState(false);
  const [toolTemperature, setToolTemperature] = useState(0.5);
  const [e2bPrompt, setE2bPrompt] = useState("Use numpy to generate 5 random numbers and return mean/std.");
  const [e2bCode, setE2bCode] = useState("");
  const [e2bOutput, setE2bOutput] = useState("");
  const [e2bModel, setE2bModel] = useState("groq/compound");
  const [e2bRunning, setE2bRunning] = useState(false);
  const [bookPrompt, setBookPrompt] = useState("Write a 6-chapter outline for a cyberpunk detective novella set on a floating city.");
  const [bookOutput, setBookOutput] = useState("");
  const [bookRunning, setBookRunning] = useState(false);
  const [songwriterPrompt, setSongwriterPrompt] = useState("Write a modern R&B hook and verse about late-night studio grind and ambition.");
  const [songwriterOutput, setSongwriterOutput] = useState("");
  const [songwriterRunning, setSongwriterRunning] = useState(false);
  const [songwriterGenre, setSongwriterGenre] = useState("R&B");
  const [songwriterBpm, setSongwriterBpm] = useState<number>(90);
  const [songwriterKey, setSongwriterKey] = useState("A minor");
  const [songwriterMood, setSongwriterMood] = useState("moody, determined");
  const [songwriterRhyme, setSongwriterRhyme] = useState("medium");
  const [songwriterSyllables, setSongwriterSyllables] = useState(8);
  const [songwriterStructure, setSongwriterStructure] = useState("Intro, Verse, Pre-Hook, Hook, Verse 2, Bridge, Hook");
  const [songwriterModel, setSongwriterModel] = useState("llama-3.3-70b-versatile");
  const [songwriterReasoning, setSongwriterReasoning] = useState<"none" | "low" | "medium" | "high">("medium");
  const [songwriterGlow, setSongwriterGlow] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voiceUrl, setVoiceUrl] = useState("");
  const [voiceLang, setVoiceLang] = useState("en");
  const [voiceModel, setVoiceModel] = useState("whisper-large-v3-turbo");
  const [voicePrompt, setVoicePrompt] = useState("");
  const [voiceResult, setVoiceResult] = useState("");
  const [voiceRunning, setVoiceRunning] = useState(false);
  const [voiceGlow, setVoiceGlow] = useState(false);
  const [ttsInput, setTtsInput] = useState("Welcome to the hyper-advanced music lab.");
  const [ttsVoice, setTtsVoice] = useState("Fritz-PlayAI");
  const [ttsModel, setTtsModel] = useState("playai-tts");
  const [ttsFormat, setTtsFormat] = useState("mp3");
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [ttsUrl, setTtsUrl] = useState("");
  const [ttsRunning, setTtsRunning] = useState(false);
  const [ttsGlow, setTtsGlow] = useState(false);
  const [autoTtsEnabled, setAutoTtsEnabled] = useState(false);
  const [autoTtsRunning, setAutoTtsRunning] = useState(false);
  const [projectContextName, setProjectContextName] = useState("");
  const [projectContextError, setProjectContextError] = useState("");
  const [projectSaves, setProjectSaves] = useState<ProjectSave[]>([]);
  const [assistantPrompt, setAssistantPrompt] = useState("Summarize today’s tasks and suggest the next 3 moves.");
  const [assistantOutput, setAssistantOutput] = useState("");
  const [assistantRunning, setAssistantRunning] = useState(false);
  const [assistantGlow, setAssistantGlow] = useState(false);
  const [songAnalysisPrompt, setSongAnalysisPrompt] = useState("Deeply analyze structure, groove, emotion, mix, lyrics, and performance. Summarize strengths, risks, and actionable improvements.");
  const [songAnalysisUrl, setSongAnalysisUrl] = useState("");
  const [songAnalysisOutput, setSongAnalysisOutput] = useState("");
  const [songAnalysisRunning, setSongAnalysisRunning] = useState(false);
  const [songAnalysisGlow, setSongAnalysisGlow] = useState(false);
  const [aiImproving, setAiImproving] = useState<Record<string, boolean>>({});
  const [sunoPrompt, setSunoPrompt] = useState("An upbeat electronic dance track with synth leads");
  const [sunoTitle, setSunoTitle] = useState("Digital Dreams");
  const [sunoStyle, setSunoStyle] = useState("Electronic Dance");
  const [sunoModel, setSunoModel] = useState("V4_5ALL");
  const [sunoInstrumental, setSunoInstrumental] = useState(false);
  const [sunoCustomMode, setSunoCustomMode] = useState(true);
  const [sunoTaskId, setSunoTaskId] = useState("");
  const [sunoStatus, setSunoStatus] = useState("");
  const [sunoTracks, setSunoTracks] = useState<SunoTrack[]>([]);
  const [sunoRunning, setSunoRunning] = useState(false);
  const [sunoPolling, setSunoPolling] = useState(false);
  const [sunoError, setSunoError] = useState("");
  const [sunoGlow, setSunoGlow] = useState(false);
  const [mainTab, setMainTab] = useState<"all" | "chat" | "e2b" | "audio" | "data" | "crm" | "eng" | "notes" | "finance" | "calendar" | "storyboard" | "songwriter" | "coder">("all");
  const [trackedTaskId, setTrackedTaskId] = useState<string | null>(tasks[0]?.id ?? null);
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>(() =>
    tasks.reduce((acc, task) => ({ ...acc, [task.id]: 0 }), {}),
  );
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(() => new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const videoObjectUrlsRef = useRef<string[]>([]);
  const autoTtsAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoTtsQueueRef = useRef<string[]>([]);
  const autoTtsAbortRef = useRef<AbortController | null>(null);
  const autoTtsInFlightRef = useRef(false);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [e2bHistory, setE2bHistory] = useState<ChatTurn[]>([]);
  const [assistantDockOpen, setAssistantDockOpen] = useState(false);
  const [assistantDockPrompt, setAssistantDockPrompt] = useState("What should I do next?");
  const [assistantDockHistory, setAssistantDockHistory] = useState<ChatTurn[]>([]);
  const [assistantDockRunning, setAssistantDockRunning] = useState(false);
  const [chatGlow, setChatGlow] = useState(false);
  const [e2bGlow, setE2bGlow] = useState(false);
  const [maverickGlow, setMaverickGlow] = useState(false);
  const [bookGlow, setBookGlow] = useState(false);
  const [compileGlow, setCompileGlow] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [compileRunning, setCompileRunning] = useState(false);
  const [compileOutput, setCompileOutput] = useState("");
  const [compileUrl, setCompileUrl] = useState("");
  const [dbHealth, setDbHealth] = useState<{ status: string; percent: number; sizeBytes: number; thresholdBytes: number } | null>(null);
  const [dbHealthError, setDbHealthError] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsGlow, setLogsGlow] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [coderGoal, setCoderGoal] = useState("Implement AI coder flow with plan approval, step execution, and tests.");
  const [coderPlanText, setCoderPlanText] = useState("");
  const [coderPlanSteps, setCoderPlanSteps] = useState<CoderStep[]>([]);
  const [coderPlanRunning, setCoderPlanRunning] = useState(false);
  const [coderPlanApproved, setCoderPlanApproved] = useState(false);
  const [coderStepStatus, setCoderStepStatus] = useState<Record<string, "pending" | "running" | "done" | "error">>({});
  const [coderStepOutputs, setCoderStepOutputs] = useState<Record<string, string>>({});
  const [coderExecLog, setCoderExecLog] = useState<string[]>([]);
  const [coderTestStatus, setCoderTestStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [coderTestOutput, setCoderTestOutput] = useState("");
  const [coderEnv, setCoderEnv] = useState<Record<string, string>>({});
  const [coderEnvKey, setCoderEnvKey] = useState("");
  const [coderEnvVal, setCoderEnvVal] = useState("");
  const [uiAgentRunning, setUiAgentRunning] = useState(false);
  const e2bWorkspaceFiles = useMemo<IdeFile[]>(
    () => [
      { path: "workspace/", type: "folder" },
      { path: "workspace/analysis/", type: "folder" },
      { path: "workspace/analysis/data.csv", type: "file", language: "csv", size: "32 KB" },
      { path: "workspace/analysis/notebook.py", type: "file", language: "python", size: "2.4 KB" },
      { path: "workspace/app/", type: "folder" },
      { path: "workspace/app/index.ts", type: "file", language: "ts", size: "4.1 KB" },
      { path: "workspace/app/utils.ts", type: "file", language: "ts", size: "1.2 KB" },
      { path: "workspace/README.md", type: "file", language: "md", size: "1.0 KB" },
    ],
    [],
  );
  const logEvent = (entry: { source: string; level?: "info" | "error"; message: string }) => {
    const payload = {
      ts: new Date().toISOString(),
      source: entry.source,
      level: entry.level || "info",
      message: entry.message,
    } as LogEntry;
    setLogs((prev) => {
      const next = [payload, ...prev];
      return next.slice(0, 200);
    });
    void fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  };
  const appendCoderLog = (line: string) => setCoderExecLog((prev) => [line, ...prev].slice(0, 200));
  const stripCodeForTts = useCallback((input: string) => {
    return input
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, []);
  const stopAutoTts = useCallback(() => {
    autoTtsQueueRef.current = [];
    autoTtsInFlightRef.current = false;
    if (autoTtsAbortRef.current) {
      autoTtsAbortRef.current.abort();
      autoTtsAbortRef.current = null;
    }
    if (autoTtsAudioRef.current) {
      autoTtsAudioRef.current.pause();
      autoTtsAudioRef.current.src = "";
      autoTtsAudioRef.current = null;
    }
    setAutoTtsRunning(false);
  }, []);
  const playAutoTtsQueue = useCallback(async () => {
    if (!autoTtsEnabled || autoTtsInFlightRef.current) return;
    const next = autoTtsQueueRef.current.shift();
    if (!next) return;
    autoTtsInFlightRef.current = true;
    setAutoTtsRunning(true);
    const controller = new AbortController();
    autoTtsAbortRef.current = controller;
    try {
      const res = await fetch("/api/audio/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: next,
          model: ttsModel,
          voice: ttsVoice,
          response_format: ttsFormat,
          speed: ttsSpeed,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data?.error || data?.detail || res.statusText;
        throw new Error(`Auto TTS failed: ${errMsg}`);
      }
      const data = await res.json();
      if (!data?.dataUrl) throw new Error("Auto TTS returned no audio.");
      const audio = new Audio(data.dataUrl);
      autoTtsAudioRef.current = audio;
      await audio.play();
      await new Promise((resolve) => {
        audio.addEventListener("ended", resolve, { once: true });
        audio.addEventListener("error", resolve, { once: true });
      });
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        const message = err instanceof Error ? err.message : "Auto TTS error.";
        logEvent({ source: "tts", level: "error", message });
      }
    } finally {
      autoTtsAbortRef.current = null;
      autoTtsInFlightRef.current = false;
      setAutoTtsRunning(false);
      if (autoTtsEnabled) {
        void playAutoTtsQueue();
      }
    }
  }, [autoTtsEnabled, logEvent, ttsFormat, ttsModel, ttsSpeed, ttsVoice]);
  const queueAutoTts = useCallback(
    (text: string) => {
      if (!autoTtsEnabled) return;
      const cleaned = stripCodeForTts(text);
      if (!cleaned) return;
      autoTtsQueueRef.current.push(cleaned);
      void playAutoTtsQueue();
    },
    [autoTtsEnabled, playAutoTtsQueue, stripCodeForTts],
  );
  const queueAutoTtsRef = useRef(queueAutoTts);
  useEffect(() => {
    queueAutoTtsRef.current = queueAutoTts;
  }, [queueAutoTts]);
  const buildSavePayload = useCallback((payload: Record<string, unknown>) => JSON.stringify(payload, null, 2), []);
  const requireProjectContext = useCallback(
    (action: string) => {
      const project = projectContextName.trim();
      if (!project) {
        const message = `Project name required to ${action}.`;
        setProjectContextError(message);
        queueAutoTts(message);
        return null;
      }
      setProjectContextError("");
      return project;
    },
    [projectContextName, queueAutoTts],
  );
  const saveProjectEntry = useCallback(
    (section: string, content: string, title?: string, meta?: Record<string, string>) => {
      const project = requireProjectContext(`save ${section}`);
      if (!project) return;
      const cleaned = content.trim();
      if (!cleaned) {
        const message = `Nothing to save for ${section}.`;
        setProjectContextError(message);
        queueAutoTts(message);
        return;
      }
      const entry: ProjectSave = {
        id: newId("save"),
        project,
        section,
        title: (title || section).trim(),
        content: cleaned,
        createdAt: new Date().toISOString(),
        meta: meta && Object.keys(meta).length ? meta : undefined,
      };
      setProjectSaves((prev) => [entry, ...prev].slice(0, 500));
      queueAutoTts(`Saved ${section} to ${project}.`);
    },
    [queueAutoTts, requireProjectContext],
  );
  const formatSaveTitle = useCallback((text: string, fallback: string) => {
    const trimmed = text.trim();
    return trimmed ? trimmed.slice(0, 60) : fallback;
  }, []);
  const latestAssistantFromHistory = useCallback((history: ChatTurn[], fallback: string) => {
    if (!history.length) return fallback;
    const last = [...history].reverse().find((turn) => turn.role === "assistant");
    return last?.content || fallback;
  }, []);
  const saveChatOutput = useCallback(() => {
    const output = latestAssistantFromHistory(chatHistory, toolOutput);
    const payload = buildSavePayload({ prompt: toolPrompt, output, history: chatHistory });
    saveProjectEntry("Chat output", payload, formatSaveTitle(toolPrompt, "Chat output"));
  }, [buildSavePayload, chatHistory, formatSaveTitle, latestAssistantFromHistory, saveProjectEntry, toolOutput, toolPrompt]);
  const saveE2bOutput = useCallback(() => {
    const output = latestAssistantFromHistory(e2bHistory, e2bOutput);
    const payload = buildSavePayload({
      prompt: e2bPrompt,
      code: e2bCode,
      output,
      history: e2bHistory,
      model: e2bModel,
    });
    saveProjectEntry("E2B run", payload, formatSaveTitle(e2bPrompt || e2bCode, "E2B run"), { model: e2bModel });
  }, [buildSavePayload, e2bCode, e2bHistory, e2bModel, e2bOutput, e2bPrompt, formatSaveTitle, latestAssistantFromHistory, saveProjectEntry]);
  const notifyMentions = (text: string, context: string) => {
    if (!text) return;
    const matches = [...text.matchAll(/@([A-Za-z0-9._-]+)/g)];
    if (!matches.length) return;
    const lower = matches.map((m) => m[1].toLowerCase());
    const targets = mentionableUsers.filter((u) => lower.includes(u.key));
    if (!targets.length) return;
    const now = new Date().toISOString();
    setNotifications((prev) => {
      const next = [...targets.map((t) => ({ id: newId("ntf"), ts: now, target: t.name, message: `${context}: ${text}` })), ...prev];
      return next.slice(0, 50);
    });
  };
  const generateCoderPlan = async () => {
    const goal = coderGoal.trim();
    if (!goal) return;
    if (!requireProjectContext("generate a coder plan")) {
      appendCoderLog("Project name required to generate a plan.");
      return;
    }
    setCoderPlanRunning(true);
    setCoderPlanApproved(false);
    setCoderPlanText("");
    setCoderPlanSteps([]);
    setCoderStepStatus({});
    setCoderStepOutputs({});
    setCoderExecLog([]);
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          prompt: `You are an AI coder. Build a concise, ordered plan for this goal.\nGoal: ${goal}\nReturn JSON ONLY: { "steps": [ { "id": "S1", "title": "...", "detail": "..." } ], "tests": "command to run" }`,
          temperature: 0.2,
          reasoning_effort: "medium",
          schema: {
            type: "object",
            properties: {
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    detail: { type: "string" },
                  },
                  required: ["id", "title", "detail"],
                },
              },
              tests: { type: "string" },
            },
            required: ["steps"],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Plan failed: ${res.status}`);
      const content = data.output || "";
      setCoderPlanText(content);
      queueAutoTts(content);
      const parsed = (() => {
        try {
          return JSON.parse(content);
        } catch {
          return data;
        }
      })();
      const steps = Array.isArray(parsed?.steps) ? parsed.steps : [];
      const mapped: CoderStep[] = steps.map((s: any, idx: number) => ({
        id: s.id || `S${idx + 1}`,
        title: s.title || `Step ${idx + 1}`,
        detail: s.detail || "Detail TBD",
      }));
      setCoderPlanSteps(mapped);
      setCoderStepStatus(mapped.reduce((acc, step) => ({ ...acc, [step.id]: "pending" }), {}));
      appendCoderLog("Plan ready. Review and approve to execute.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Plan generation error.";
      appendCoderLog(`Plan error: ${message}`);
    } finally {
      setCoderPlanRunning(false);
    }
  };

  const approveCoderPlan = () => {
    if (!coderPlanSteps.length) return;
    setCoderPlanApproved(true);
    appendCoderLog("Plan approved. Ready to execute steps.");
  };

  const runCoderSteps = async () => {
    if (!coderPlanApproved || !coderPlanSteps.length) {
      appendCoderLog("Approve the plan before executing.");
      return;
    }
    if (!requireProjectContext("run coder steps")) {
      appendCoderLog("Project name required to run steps.");
      return;
    }
    for (const step of coderStepList) {
      setCoderStepStatus((prev) => ({ ...prev, [step.id]: "running" }));
      appendCoderLog(`Running ${step.id}: ${step.title}`);
      try {
        const res = await fetch("/api/groq-compound", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            prompt: `Execute this coding step and produce concrete patches.\nStep: ${step.title}\nDetail: ${step.detail}\nGoal: ${coderGoal}\nReturn a short summary followed by code blocks with file paths and contents.`,
            temperature: 0.25,
            reasoning_effort: "medium",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `Step failed: ${res.status}`);
        const output = data.output || "Step completed.";
        setCoderStepOutputs((prev) => ({ ...prev, [step.id]: output }));
        queueAutoTts(output);
        setCoderStepStatus((prev) => ({ ...prev, [step.id]: "done" }));
        appendCoderLog(`Finished ${step.id}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Step error.";
        setCoderStepOutputs((prev) => ({ ...prev, [step.id]: message }));
        queueAutoTts(message);
        setCoderStepStatus((prev) => ({ ...prev, [step.id]: "error" }));
        appendCoderLog(`Error on ${step.id}: ${message}`);
        break;
      }
    }
    await runCoderTests();
  };

  const runCoderTests = async () => {
    if (!coderPlanApproved) return;
    if (!requireProjectContext("run coder tests")) {
      appendCoderLog("Project name required to run tests.");
      return;
    }
    setCoderTestStatus("running");
    setCoderTestOutput("");
    appendCoderLog("Running tests...");
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          prompt: `Given the goal "${coderGoal}", propose the exact test command to run and expected outcomes. If failures are likely, suggest fixes.`,
          temperature: 0.2,
          reasoning_effort: "low",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Test step failed: ${res.status}`);
      const output = data.output || "Tests completed.";
      setCoderTestOutput(output);
      queueAutoTts(output);
      setCoderTestStatus("done");
      appendCoderLog("Tests ready. Review output.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Test error.";
      setCoderTestOutput(message);
      queueAutoTts(message);
      setCoderTestStatus("error");
      appendCoderLog(`Test error: ${message}`);
    }
  };

  const addCoderEnv = () => {
    const key = coderEnvKey.trim();
    if (!key) return;
    setCoderEnv((prev) => ({ ...prev, [key]: coderEnvVal }));
    setCoderEnvKey("");
    setCoderEnvVal("");
    appendCoderLog(`Set env ${key}`);
  };

  const summary = useMemo(
    () => {
      const workstationCount = Object.values(workstations).reduce((total, batch) => total + batch.length, 0);
      return {
        projectCount: projects.length,
        taskCount: tasks.length,
        noteCount: notes.length,
        agentCount: agents.length,
        workstationCount,
        dueSoon: tasks.filter((task) => task.due && new Date(task.due) <= new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)).length,
      };
    },
    [notes.length, projects.length, tasks, agents.length, workstations],
  );
  const projectSavesByProject = useMemo(() => {
    return projectSaves.reduce<Record<string, ProjectSave[]>>((acc, entry) => {
      const key = entry.project || "Unassigned";
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [projectSaves]);

  const calendarItems = useMemo(() => {
    return tasks
      .filter((task) => task.due)
      .map((task) => ({
        key: `task-${task.id}`,
        title: task.title,
        date: task.due,
        time: "10:00",
        owner: task.owner,
        tag: "Task",
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks]);

  const activeClient = useMemo(() => clients.find((c) => c.id === activeClientId) || null, [clients, activeClientId]);
  const clientProjects = useMemo(() => {
    if (!activeClient) return [];
    const name = activeClient.name.toLowerCase();
    return projects.filter((p) => (p.client || "").toLowerCase() === name);
  }, [activeClient, projects]);
  const activeProject = useMemo(() => clientProjects.find((p) => p.id === activeProjectId) || null, [clientProjects, activeProjectId]);
  const projectTasks = useMemo(() => {
    if (!activeProject) return [];
    const name = activeProject.name.toLowerCase();
    return tasks.filter((t) => (t.project || "").toLowerCase() === name);
  }, [activeProject, tasks]);
  const mentionableUsers = useMemo(() => agents.map((a) => ({ id: a.id, name: a.name, key: a.name.toLowerCase() })), [agents]);
  const coderStepList = useMemo(() => coderPlanSteps || [], [coderPlanSteps]);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
      const data = (await res.json()) as DashboardState;
      if (Array.isArray(data.projects)) setProjects(data.projects);
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.notes)) setNotes(data.notes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard data.";
      setDashboardError(message);
      queueAutoTtsRef.current(message);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("illco.projectSaves");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setProjectSaves(parsed as ProjectSave[]);
      }
    } catch {
      // Ignore malformed cache.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("illco.projectSaves", JSON.stringify(projectSaves));
    } catch {
      // Storage may be unavailable.
    }
  }, [projectSaves]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const loadDbHealth = async () => {
      try {
        const res = await fetch("/api/db/health");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `DB health failed: ${res.status}`);
        setDbHealth({
          status: data.status,
          percent: data.percent,
          sizeBytes: data.sizeBytes,
          thresholdBytes: data.thresholdBytes,
        });
        setDbHealthError("");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "DB health check failed.";
        setDbHealth(null);
        setDbHealthError(message);
        queueAutoTtsRef.current(message);
      }
    };
    loadDbHealth();
    timer = setInterval(loadDbHealth, 60000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!activeClientId && clients.length) {
      setActiveClientId(clients[0].id);
    }
    if (activeClientId && !clients.some((c) => c.id === activeClientId)) {
      setActiveClientId(clients[0]?.id ?? null);
    }
  }, [clients, activeClientId]);

  useEffect(() => {
    if (clientProjects.length && !activeProjectId) {
      setActiveProjectId(clientProjects[0].id);
      return;
    }
    if (activeProjectId && !clientProjects.some((p) => p.id === activeProjectId)) {
      setActiveProjectId(clientProjects[0]?.id ?? null);
    }
  }, [clientProjects, activeProjectId]);

  const persistDashboard = async (partial: Partial<DashboardState>) => {
    try {
      const body: DashboardState = {
        projects: partial.projects ?? projects,
        tasks: partial.tasks ?? tasks,
        notes: partial.notes ?? notes,
      };
      await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // Non-blocking; UI already updated.
    }
  };

  useEffect(() => {
    if (mainTab === "calendar") {
      void fetchDashboard();
    }
  }, [mainTab, fetchDashboard]);
  const addProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    const nextProjects = [
      ...projects,
      { id: newId("p"), name, client: newProjectClient.trim() || "Unassigned", status: "Planned", owner: newProjectOwner },
    ];
    setProjects(nextProjects);
    void persistDashboard({ projects: nextProjects });
    setNewProjectName("");
    setNewProjectClient("");
  };

  const addTask = () => {
    const title = newTaskTitle.trim();
    const project = newTaskProject || "Unassigned";
    if (!title) return;
    const nextTasks = [
      ...tasks,
      { id: newId("t"), title, project, status: "Todo", due: newTaskDue || "", owner: "" },
    ];
    setTasks(nextTasks);
    void persistDashboard({ tasks: nextTasks });
    notifyMentions(`${title} ${project}`, "Task");
    setNewTaskTitle("");
    setNewTaskProject("");
    setNewTaskDue("");
  };

  const addNote = () => {
    const title = newNoteTitle.trim();
    if (!title) return;
    const nextNotes = [
      ...notes,
      { id: newId("n"), title, content: newNoteContent.trim() || "", reference: newNoteReference || "" },
    ];
    setNotes(nextNotes);
    void persistDashboard({ notes: nextNotes });
    notifyMentions(`${title} ${newNoteContent}`, "Note");
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteReference("");
  };

  const addAgent = () => {
    const name = newAgentName.trim();
    if (!name) return;
    const role = newAgentRole.trim() || "Agent";
    const newAgent = { id: newId("a"), name, role, status: "Idle", poweredBy: "Groq Assistant" };
    setAgents((prev) => [...prev, newAgent]);
    setWorkstations((prev) => ({ ...prev, [newAgent.id]: [] }));
    setNewAgentName("");
    setNewAgentRole("");
    setActiveAgentId(newAgent.id);
  };

  const addWorkstation = () => {
    if (!activeAgentId || !workstationTitle.trim()) return;
    const instruction = workstationInstruction.trim() || "Describe what the workstation should deliver.";
    const code = `// Workstation: ${workstationTitle}\n// Instruction: ${instruction}\n// Updated by agent ${agents.find((agent) => agent.id === activeAgentId)?.name ?? "unknown"}\n`;
    setWorkstations((prev) => ({
      ...prev,
      [activeAgentId]: [
        ...(prev[activeAgentId] ?? []),
        { id: newId("w"), title: workstationTitle.trim(), instruction, code, createdAt: new Date().toISOString() },
      ],
    }));
    setWorkstationTitle("");
    setWorkstationInstruction("");
  };

  const addPromptEntry = (text: string, label?: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    const effectiveLabel = (label || cleanText.slice(0, 40) || "Saved prompt").trim();
    setPromptLibrary((prev) => {
      if (prev.some((p) => p.text === cleanText)) return prev;
      return [...prev, { id: newId("pr"), label: effectiveLabel, text: cleanText }];
    });
  };

  const addPrompt = () => {
    const label = newPromptLabel.trim();
    const text = newPromptText.trim();
    if (!label || !text) return;
    addPromptEntry(text, label);
    setNewPromptLabel("");
    setNewPromptText("");
  };

  const addApiDoc = () => {
    const title = newDocTitle.trim();
    const url = newDocUrl.trim();
    if (!title || !url) return;
    setApiDocs((prev) => [
      ...prev,
      { id: newId("doc"), title, url, description: newDocDescription.trim() || "API documentation" },
    ]);
    setNewDocTitle("");
    setNewDocUrl("");
    setNewDocDescription("");
  };

  const addClient = () => {
    const name = newClientName.trim();
    if (!name) return;
    const id = newId("cli");
    setClients((prev) => [
      ...prev,
      {
        id,
        name,
        status: newClientStatus,
        priority: newClientPriority,
        accountOwner: "Unassigned",
        company: newClientCompany.trim(),
        primaryContact: newClientName.trim(),
        email: newClientEmail.trim(),
        phone: newClientPhone.trim(),
        website: "",
        timezone: "",
        contactMethod: "email",
        source: "other",
        referrer: "",
        estimatedValue: 0,
        expectedClose: newClientExpectedClose,
        lastContact: "",
      },
    ]);
    setActiveClientId(id);
    setNewClientName("");
    setNewClientCompany("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientExpectedClose("");
  };

  const addMeeting = () => {
    const name = meetingName.trim();
    if (!name || !meetingClientId) return;
    setMeetings((prev) => [
      ...prev,
      {
        id: newId("mtg"),
        name,
        clientId: meetingClientId,
        date: meetingDate,
        location: "",
        organizer: "Unassigned",
        type: meetingType,
      },
    ]);
    notifyMentions(name, "Meeting");
    setMeetingName("");
    setMeetingDate("");
  };

  const claimTask = (taskId: string) => {
    const agent = agents.find((a) => a.id === activeAgentId);
    const assignee = agent?.name || "Agent";
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, owner: assignee } : t));
      void persistDashboard({ tasks: next });
      return next;
    });
    if (trackedTaskId === taskId) {
      setTrackedTaskId(taskId);
    }
  };

  const updateTaskStatus = (taskId: string, status: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, status } : t));
      void persistDashboard({ tasks: next });
      return next;
    });
  };

  const addGithubProject = () => {
    const project = ghName.trim();
    if (!project) return;
    setGithubProjects((prev) => [
      ...prev,
      {
        id: newId("gh"),
        project,
        status: ghStatus,
        category: ghCategory,
        owner: ghOwner.trim(),
        repoUrl: ghRepoUrl.trim(),
        description: "",
        keyFeatures: "",
        completion: "",
        lastUpdated: new Date().toISOString().slice(0, 10),
        mirror: false,
      },
    ]);
    setGhName("");
    setGhRepoUrl("");
    setGhOwner("");
  };

  const addSoraTab = () => {
    const name = soraName.trim();
    if (!name || !soraLink.trim()) return;
    setSoraTabs((prev) => [
      ...prev,
      { id: newId("sora"), name, link: soraLink.trim(), order: Number(soraOrder) || 0 },
    ]);
    setSoraName("");
    setSoraLink("");
    setSoraOrder(1);
  };

  const addNoteEntry = () => {
    const name = noteEntryName.trim();
    if (!name) return;
    setNoteEntries((prev) => [
      ...prev,
      {
        id: newId("note"),
        name,
        status: noteEntryStatus,
        created: new Date().toISOString().slice(0, 10),
        edited: new Date().toISOString(),
        notebookId: noteEntryNotebookId || undefined,
        favorite: noteEntryFavorite,
        pin: noteEntryPin,
        archive: false,
      },
    ]);
    notifyMentions(`${name} ${noteEntryNotebookId}`, "Notebook note");
    setNoteEntryName("");
    setNoteEntryNotebookId("");
    setNoteEntryFavorite(false);
    setNoteEntryPin(false);
  };

  const addNotebook = () => {
    const name = notebookName.trim();
    if (!name) return;
    setNotebooks((prev) => [
      ...prev,
      { id: newId("nb"), name, edited: new Date().toISOString(), archive: notebookArchive },
    ]);
    setNotebookName("");
    setNotebookArchive(false);
  };

  const calculatePayrollTotal = () => {
    const bonuses = Number(payrollBonuses) || 0;
    const deductions = Number(payrollDeductions) || 0;
    const overrideAmount = Number(payrollOverrideAmount) || 0;
    if (payrollType === "Project Based") {
      const base = (Number(payrollTasks) || 0) * (Number(payrollRate) || 0);
      return base + bonuses - deductions + overrideAmount;
    }
    if (payrollType === "Hourly") {
      const weeks =
        payrollStart && payrollEnd
          ? Math.max(
              1,
              Math.ceil(
                (new Date(payrollEnd).getTime() - new Date(payrollStart).getTime()) /
                  (1000 * 60 * 60 * 24 * 7),
              ),
            )
          : 1;
      const base = (Number(payrollWeeklyHours) || 0) * (Number(payrollRate) || 0) * weeks;
      return base + bonuses - deductions + overrideAmount;
    }
    // Fixed
    return (Number(payrollRate) || 0) + bonuses - deductions + overrideAmount;
  };

  const addPayrollRun = () => {
    const name = payrollName.trim();
    if (!name) return;
    setPayrollRuns((prev) => [
      ...prev,
      {
        id: newId("pay"),
        runName: name,
        type: payrollType,
        periodStart: payrollStart,
        periodEnd: payrollEnd,
        rate: Number(payrollRate) || 0,
        weeklyHours: Number(payrollWeeklyHours) || 0,
        tasksCompleted: Number(payrollTasks) || 0,
        bonuses: Number(payrollBonuses) || 0,
        deductions: Number(payrollDeductions) || 0,
        overrideAmount: Number(payrollOverrideAmount) || 0,
        bankName: payrollBankName.trim(),
        accountNumber: payrollAccountNumber.trim(),
        country: payrollCountry.trim(),
        city: payrollCity.trim(),
        address: payrollAddress.trim(),
        postalCode: payrollPostalCode.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setPayrollName("");
    setPayrollRate(0);
    setPayrollWeeklyHours(40);
    setPayrollTasks(0);
    setPayrollBonuses(0);
    setPayrollDeductions(0);
    setPayrollOverrideAmount(0);
    setPayrollBankName("");
    setPayrollAccountNumber("");
    setPayrollCountry("");
    setPayrollCity("");
    setPayrollAddress("");
    setPayrollPostalCode("");
  };

  const addFundraisingEntry = () => {
    const name = fundName.trim();
    if (!name) return;
    setFundraisingEntries((prev) => [
      ...prev,
      {
        id: newId("fr"),
        name,
        status: fundStatus,
        description: fundDescription.trim(),
        avgCheckSize: Number(fundAvgCheck) || 0,
        capitalCommitted: Number(fundCapital) || 0,
        partnerName: fundPartnerName.trim(),
        partnerEmail: fundPartnerEmail.trim(),
        firmLinkedIn: "",
        portfolio: "",
        warmContactName: fundWarmName.trim(),
        warmContactEmail: fundWarmEmail.trim(),
        lostReason: fundLostReason.trim(),
      },
    ]);
    setFundName("");
    setFundAvgCheck(0);
    setFundCapital(0);
    setFundPartnerName("");
    setFundPartnerEmail("");
    setFundWarmName("");
    setFundWarmEmail("");
    setFundDescription("");
    setFundLostReason("");
  };

  const addCategory = () => {
    const name = categoryName.trim();
    if (!name) return;
    setCategories((prev) => [...prev, { id: newId("cat"), name, spentMonth: 0, spentTotal: 0 }]);
    setCategoryName("");
  };

  const addPlatformCost = () => {
    const tool = platformTool.trim();
    if (!tool) return;
    setPlatformCosts((prev) => [
      ...prev,
      {
        id: newId("pc"),
        tool,
        vendor: platformVendor,
        usedFor: platformUsedFor.split(",").map((v) => v.trim()).filter(Boolean),
        costModel: platformCostModel.split(",").map((v) => v.trim()).filter(Boolean),
        billingUnit: platformBillingUnit,
        subscriptionPrice: Number(platformSubscription) || 0,
        creditsPackPrice: Number(platformCredits) || 0,
        usagePrice: platformUsagePrice,
        renewalDate: platformRenewal,
        active: platformActive,
        adminUrl: platformAdminUrl,
        notes: platformNotes,
      },
    ]);
    setPlatformTool("");
    setPlatformAdminUrl("");
    setPlatformUsagePrice("");
    setPlatformNotes("");
  };

  const addStoryClip = () => {
    const name = storyClipName.trim();
    const mediaUrl = storyClipUrl.trim();
    if (!name || !mediaUrl) return;
    const start = Number(storyClipStart) || 0;
    const end = Number(storyClipEnd) || 0;
    setStoryClips((prev) => [
      ...prev,
      { id: newId("clip"), name, mediaUrl, start, end, solo: false },
    ]);
    setStoryClipName("");
    setStoryClipUrl("");
    setStoryClipStart(0);
    setStoryClipEnd(0);
  };

  const addStoryTransition = () => {
    if (!transitionFrom || !transitionTo) return;
    setStoryTransitions((prev) => [
      ...prev,
      {
        id: newId("trans"),
        fromId: transitionFrom,
        toId: transitionTo,
        type: transitionType,
        duration: Number(transitionDuration) || 1,
      },
    ]);
    setTransitionFrom("");
    setTransitionTo("");
    setTransitionDuration(1);
  };

  const toggleClipSolo = (clipId: string) => {
    setStoryClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, solo: !c.solo } : c)),
    );
  };

  const transitionPresets = [
    { type: "Cut", duration: 0, label: "Cut (0s)" },
    { type: "Crossfade", duration: 0.5, label: "Crossfade (0.5s)" },
    { type: "Dip to Black", duration: 0.75, label: "Dip to Black (0.75s)" },
    { type: "Whip Pan", duration: 0.35, label: "Whip Pan (0.35s)" },
    { type: "Match Cut", duration: 0, label: "Match Cut (0s)" },
    { type: "J-cut", duration: 0.25, label: "J-cut (0.25s)" },
    { type: "L-cut", duration: 0.25, label: "L-cut (0.25s)" },
    { type: "Zoom Blur", duration: 0.4, label: "Zoom Blur (0.4s)" },
    { type: "Glitch", duration: 0.3, label: "Glitch (0.3s)" },
  ];

  const showTab = (tab: typeof mainTab) => mainTab === "all" || mainTab === tab;
  const defaultGroqTools = ["web_search", "code_interpreter", "visit_website", "browser_automation"];

  const runStoryboardAgent = async () => {
    setStoryboardRunning(true);
    setStoryboardOutput("");
    setStoryboardShots([]);
    setStoryboardNotes("");
    const instruction = `You are a music video storyboarder. Create a concise timeline with 6-9 shots.
Return JSON ONLY: { "shots": [ { "id": "S1", "name": "...", "beat": "what happens", "duration": "3-5s", "camera": "move/lens", "transition": "Cut/Crossfade/Whip/etc", "mood": "optional tone" } ], "notes": "1-2 bullet summary" }
Keep durations 2-6s, avoid slow pacing, keep camera moves varied.`;
    const payload = {
      model: "llama-3.3-70b-versatile",
      prompt: `${instruction}\n\nUser brief: ${storyboardPrompt}`,
      temperature: 0.4,
      reasoning_effort: "medium",
      schema: {
        type: "object",
        properties: {
          shots: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                beat: { type: "string" },
                duration: { type: "string" },
                camera: { type: "string" },
                transition: { type: "string" },
                mood: { type: "string" },
              },
              required: ["id", "name", "beat", "duration", "camera", "transition"],
            },
          },
          notes: { type: "string" },
        },
      },
    };
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Groq storyboard agent failed: ${res.status}`);
      const data = await res.json();
      const content = data.output || "Storyboard generated.";
      setStoryboardOutput(content);
      const parsed = (() => {
        try {
          return JSON.parse(content);
        } catch {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              return JSON.parse(match[0]);
            } catch {
              return null;
            }
          }
          return null;
        }
      })();
      if (parsed?.shots && Array.isArray(parsed.shots)) {
        const mapped = (parsed.shots as Partial<StoryboardShot>[]).map((shot, idx) => ({
          id: shot.id || `S${idx + 1}`,
          name: shot.name || shot.beat || `Shot ${idx + 1}`,
          beat: shot.beat || shot.name || "Action/beat TBD",
          duration: shot.duration || "3-5s",
          camera: shot.camera || "Static",
          transition: shot.transition || "Cut",
          mood: shot.mood,
        }));
        setStoryboardShots(mapped);
      }
      if (parsed?.notes && typeof parsed.notes === "string") {
        setStoryboardNotes(parsed.notes);
      }
      const spoken = parsed?.notes && typeof parsed.notes === "string" ? parsed.notes : content;
      queueAutoTts(spoken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Storyboard agent error.";
      setStoryboardOutput(message);
      setStoryboardShots([]);
      setStoryboardNotes("");
      queueAutoTts(message);
    } finally {
      setStoryboardRunning(false);
    }
  };

  const runMaverickClipEdits = async () => {
    if (!storyClips.length) {
      const message = "Add clips first, then apply Maverick edits.";
      setMaverickOutput(message);
      queueAutoTts(message);
      return;
    }
    setMaverickRunning(true);
    setMaverickOutput("");
    const clipSummary = storyClips
      .map((c) => `- ${c.id} | ${c.name} | ${c.mediaUrl} | start ${c.start}s end ${c.end || "end"}s | solo ${c.solo}`)
      .join("\n");
    const instruction = `
You are Maverick vision agent. Adjust clip timings and solo flags precisely based on the user prompt.
Return ONLY JSON: { "edits": [ { "id": "clip-id", "start": number, "end": number, "solo": boolean } ] }
If a clip is missing, keep it unchanged.
Current clips:
${clipSummary}
User prompt: ${maverickPrompt}
`;
    const payload = {
      model: "llama-3.3-70b-versatile",
      prompt: instruction,
      temperature: 0.2,
      reasoning_effort: "high",
      schema: {
        type: "object",
        properties: {
          edits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                start: { type: "number" },
                end: { type: "number" },
                solo: { type: "boolean" },
              },
              required: ["id"],
            },
          },
        },
      },
    };
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error || data?.detail || `Maverick request failed: ${res.status}`;
        throw new Error(errMsg);
      }
      const output = data.output || "Edits applied.";
      setMaverickOutput(output);
      queueAutoTts(output);
      logEvent({ source: "maverick", level: "info", message: "Maverick edits OK" });
      setMaverickGlow(true);
      setTimeout(() => setMaverickGlow(false), 1200);
      // Try to parse JSON response and apply edits + trims.
      const parsed = (() => {
        try {
          return JSON.parse(data.output || "{}");
        } catch {
          return undefined;
        }
      })();
      if (parsed?.edits && Array.isArray(parsed.edits)) {
        const edits = parsed.edits as { id?: string; start?: number; end?: number; solo?: boolean }[];
        const updated = await Promise.all(
          storyClips.map(async (clip) => {
            const edit = edits.find((e) => e.id === clip.id);
            if (!edit) return clip;
            const nextStart = typeof edit.start === "number" && edit.start >= 0 ? edit.start : clip.start;
            const nextEnd = typeof edit.end === "number" && edit.end > nextStart ? edit.end : clip.end;
            const nextSolo = typeof edit.solo === "boolean" ? edit.solo : clip.solo;
            let nextUrl = clip.mediaUrl;
            if (edit.start !== undefined || edit.end !== undefined) {
              try {
                const trimRes = await fetch("/api/video/trim", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: clip.mediaUrl, start: nextStart, end: nextEnd, id: clip.id }),
                });
                const trimData = await trimRes.json();
                if (trimRes.ok && trimData?.dataUrl) {
                  nextUrl = trimData.dataUrl;
                } else {
                  console.warn("Trim failed", trimData?.error || trimRes.statusText);
                }
              } catch (e) {
                console.warn("Trim request error", e);
              }
            }
            return { ...clip, start: nextStart, end: nextEnd, solo: nextSolo, mediaUrl: nextUrl };
          }),
        );
        setStoryClips(updated);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Maverick vision edit error.";
      setMaverickOutput(message);
      queueAutoTts(message);
      logEvent({ source: "maverick", level: "error", message });
      setMaverickGlow(true);
      setTimeout(() => setMaverickGlow(false), 1200);
    } finally {
      setMaverickRunning(false);
    }
  };

  const exportStoryboardManifest = () => {
    const manifest = {
      audio: storyAudioUrl,
      clips: storyClips,
      transitions: storyTransitions,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "storyboard-manifest.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addWidget = () => {
    if (!activeAgentId || !widgetLabel.trim()) return;
    const widget: Widget = {
      id: newId("wgt"),
      type: widgetType,
      label: widgetLabel.trim(),
      menu: widgetType === "dropdown" ? widgetMenu.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
      action: widgetType === "button" ? widgetAction : undefined,
    };
    setWorkspaceWidgets((prev) => ({
      ...prev,
      [activeAgentId]: [...(prev[activeAgentId] ?? []), widget],
    }));
    setWidgetLabel("");
    setWidgetMenu("General,Context,Persona");
    setWidgetAction("Send");
  };

  const moveWidget = (agentId: string, index: number, delta: number) => {
    setWorkspaceWidgets((prev) => {
      const entries = prev[agentId] ?? [];
      if (index + delta < 0 || index + delta >= entries.length) return prev;
      const next = [...entries];
      const temp = next[index];
      next[index] = next[index + delta];
      next[index + delta] = temp;
      return { ...prev, [agentId]: next };
    });
  };

  const runGroqCompoundTool = async () => {
    const prompt = toolPrompt.trim();
    if (!prompt) {
      const message = "Enter a prompt to send to Groq.";
      setToolOutput(message);
      queueAutoTts(message);
      return;
    }
    const normalized = prompt.toLowerCase();
    if (normalized.includes("add to prompt library")) {
      addPromptEntry(prompt, "Saved prompt");
      logEvent({ source: "prompt-library", level: "info", message: "Prompt saved automatically" });
    }
    notifyMentions(prompt, "Chat");
    setToolRunning(true);
    setToolOutput("");
    const schema = { type: "object", properties: {} };
    const lowerPrompt = prompt.toLowerCase();
    const needsReasoning = /(analy|plan|debug|test|fix|investigate)/i.test(lowerPrompt);
    const reasoningModel = lowerPrompt.includes("debug") || lowerPrompt.includes("analy")
      ? "gpt-oss-120b"
      : "llama-3.1-70b-versatile";
    const model = needsReasoning ? reasoningModel : "llama-3.1-8b-instant";
    const newHistory = [...chatHistory, { role: "user", content: prompt }];
    const payload = {
      model,
      prompt,
      temperature: toolTemperature,
      reasoning_effort: needsReasoning ? "high" : "low",
      schema,
      history: newHistory,
    };
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const detailMessage =
          (data && (data.error || data.detail || data.message)) || `Groq call failed: ${res.status}`;
        throw new Error(detailMessage);
      }
      const assistantContent = data.output || "Received response from Groq compound.";
      setToolOutput(assistantContent);
      queueAutoTts(assistantContent);
      setChatHistory([...newHistory, { role: "assistant", content: assistantContent }]);
      logEvent({ source: "groq-compound", level: "info", message: `OK chat (${model})` });
      setChatGlow(true);
      setTimeout(() => setChatGlow(false), 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Groq compound request error. Ensure /api/groq-compound is implemented.";
      const errMsg = message || "Groq compound request error. Ensure /api/groq-compound is implemented.";
      setToolOutput(errMsg);
      queueAutoTts(errMsg);
      setChatHistory([...newHistory, { role: "assistant", content: errMsg }]);
      logEvent({ source: "groq-compound", level: "error", message: errMsg });
      setChatGlow(true);
      setTimeout(() => setChatGlow(false), 1200);
    } finally {
      setToolRunning(false);
    }
  };

  const runAssistantDock = async () => {
    const prompt = assistantDockPrompt.trim();
    if (!prompt) return;
    const history = [...assistantDockHistory, { role: "user", content: prompt }];
    setAssistantDockHistory(history);
    setAssistantDockPrompt("");
    setAssistantDockRunning(true);
    const needsReasoning = /(plan|deploy|fix|write|generate|script|code|investigate|improve|analy)/i.test(prompt);
    const model = needsReasoning ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
    notifyMentions(prompt, "Assistant dock");
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          temperature: 0.4,
          reasoning_effort: needsReasoning ? "high" : "medium",
          history,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data?.error || data?.detail || data?.message || `Assistant failed: ${res.status}`;
        throw new Error(detail);
      }
      const assistantContent = data.output || "Assistant ready.";
      setAssistantDockHistory((prev) => [...prev, { role: "assistant", content: assistantContent }]);
      queueAutoTts(assistantContent);
      logEvent({ source: "assistant-dock", level: "info", message: `OK (${model})` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Assistant agent error.";
      setAssistantDockHistory((prev) => [...prev, { role: "assistant", content: message }]);
      queueAutoTts(message);
      logEvent({ source: "assistant-dock", level: "error", message });
    } finally {
      setAssistantDockRunning(false);
    }
  };

  const clearAssistantDock = () => {
    setAssistantDockHistory([]);
  };

  const runE2b = async () => {
    const prompt = e2bPrompt.trim();
    if (!prompt && !e2bCode.trim()) {
      const message = "Enter a prompt or paste code to run.";
      setE2bOutput(message);
      queueAutoTts(message);
      return;
    }
    if (!requireProjectContext("run E2B code")) {
      return;
    }
    setE2bRunning(true);
    setE2bOutput("");
    const newHistory = prompt ? [...e2bHistory, { role: "user", content: prompt }] : [...e2bHistory];
    try {
      const res = await fetch("/api/e2b/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          code: e2bCode || undefined,
          model: e2bModel,
          history: newHistory,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = (data && (data.error || data.message || data.detail)) || `E2B run failed: ${res.status}`;
        throw new Error(errMsg);
      }
      const assistantContent = data.output || "Run completed.";
      setE2bOutput(assistantContent);
      queueAutoTts(assistantContent);
      setE2bHistory([...newHistory, { role: "assistant", content: assistantContent }]);
      logEvent({ source: "e2b", level: "info", message: "E2B run OK" });
      setE2bGlow(true);
      setTimeout(() => setE2bGlow(false), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "E2B run error.";
      setE2bOutput(message);
      queueAutoTts(message);
      setE2bHistory([...newHistory, { role: "assistant", content: message }]);
      logEvent({ source: "e2b", level: "error", message });
      setE2bGlow(true);
      setTimeout(() => setE2bGlow(false), 1200);
    } finally {
      setE2bRunning(false);
    }
  };

  const runBookAgent = async () => {
    const prompt = bookPrompt.trim();
    if (!prompt) {
      const message = "Enter a prompt for the book agent.";
      setBookOutput(message);
      queueAutoTts(message);
      return;
    }
    setBookRunning(true);
    setBookOutput("");
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          prompt,
          temperature: 0.4,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Book agent failed: ${res.status}`);
      const output = data.output || "Generated.";
      setBookOutput(output);
      queueAutoTts(output);
      logEvent({ source: "book-agent", level: "info", message: "Book agent OK" });
      setBookGlow(true);
      setTimeout(() => setBookGlow(false), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Book agent error.";
      setBookOutput(message);
      queueAutoTts(message);
      logEvent({ source: "book-agent", level: "error", message });
      setBookGlow(true);
      setTimeout(() => setBookGlow(false), 1200);
    } finally {
      setBookRunning(false);
    }
  };

  const runSongwriter = async () => {
    const prompt = songwriterPrompt.trim();
    if (!prompt) {
      const message = "Enter a songwriting brief.";
      setSongwriterOutput(message);
      queueAutoTts(message);
      return;
    }
    setSongwriterRunning(true);
    setSongwriterOutput("");
    const reasoningEffort = songwriterReasoning === "none" ? undefined : songwriterReasoning;
    const composedPrompt = `
You are an advanced songwriting agent. Write original lyrics (no boilerplate), respecting rhyme density (${songwriterRhyme}) and ~${songwriterSyllables} syllables/line on average.
Include strong imagery, internal rhyme, and keep sections labeled clearly.
Style/genre: ${songwriterGenre}
Key (for vibe only): ${songwriterKey}
BPM (for cadence only): ${songwriterBpm}
Mood: ${songwriterMood}
Structure: ${songwriterStructure}
User brief: ${prompt}

Deliver sections in order, with concise bars. Avoid filler words. Do not include explanations.`;
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: songwriterModel,
          prompt: composedPrompt,
          temperature: 0.5,
          reasoning_effort: reasoningEffort,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || `Songwriter failed: ${res.status}`);
      const output = data.output || "Generated.";
      setSongwriterOutput(output);
      queueAutoTts(output);
      logEvent({ source: "songwriter", level: "info", message: "Songwriter OK" });
      setSongwriterGlow(true);
      setTimeout(() => setSongwriterGlow(false), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Songwriter error.";
      setSongwriterOutput(message);
      queueAutoTts(message);
      logEvent({ source: "songwriter", level: "error", message });
      setSongwriterGlow(true);
      setTimeout(() => setSongwriterGlow(false), 1200);
    } finally {
      setSongwriterRunning(false);
    }
  };

  const runTranscription = async () => {
    if (!voiceFile && !voiceUrl.trim()) {
      const message = "Attach an audio file or provide a URL.";
      setVoiceResult(message);
      queueAutoTts(message);
      return;
    }
    setVoiceRunning(true);
    setVoiceResult("");
    try {
      const form = new FormData();
      form.append("model", voiceModel);
      form.append("language", voiceLang);
      if (voicePrompt.trim()) form.append("prompt", voicePrompt.trim());
      if (voiceUrl.trim()) form.append("url", voiceUrl.trim());
      if (voiceFile) form.append("file", voiceFile, voiceFile.name);
      const res = await fetch("/api/audio/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Transcription failed: ${res.status}`);
      const output = data.text || "No text returned.";
      setVoiceResult(output);
      queueAutoTts(output);
      logEvent({ source: "voice", level: "info", message: "Voice transcription OK" });
      setVoiceGlow(true);
      setTimeout(() => setVoiceGlow(false), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transcription error.";
      setVoiceResult(message);
      queueAutoTts(message);
      logEvent({ source: "voice", level: "error", message });
      setVoiceGlow(true);
      setTimeout(() => setVoiceGlow(false), 1200);
    } finally {
      setVoiceRunning(false);
    }
  };

  const runTts = async () => {
    if (!ttsInput.trim()) {
      setTtsUrl("");
      return;
    }
    setTtsRunning(true);
    setTtsUrl("");
    try {
      const res = await fetch("/api/audio/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: ttsInput.trim(),
          model: ttsModel,
          voice: ttsVoice,
          response_format: ttsFormat,
          speed: ttsSpeed,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data?.error || res.statusText;
        throw new Error(`TTS failed: ${errMsg}`);
      }
      const data = await res.json();
      setTtsUrl(data.dataUrl || "");
      logEvent({ source: "tts", level: "info", message: "TTS OK" });
      setTtsGlow(true);
      setTimeout(() => setTtsGlow(false), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "TTS error.";
      setTtsUrl("");
      logEvent({ source: "tts", level: "error", message });
      setTtsGlow(true);
      setTimeout(() => setTtsGlow(false), 1200);
    } finally {
      setTtsRunning(false);
    }
  };

  const runAssistant = async () => {
    const prompt = assistantPrompt.trim();
    if (!prompt) {
      const message = "Enter a prompt for the personal assistant.";
      setAssistantOutput(message);
      queueAutoTts(message);
      return;
    }
    setAssistantRunning(true);
    setAssistantOutput("");
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || `Assistant failed: ${res.status}`);
      const reply = data.reply || data.output || "Done.";
      setAssistantOutput(reply);
      queueAutoTts(reply);
      logEvent({ source: "assistant", level: "info", message: "Personal assistant OK" });
      setAssistantGlow(true);
      setTimeout(() => setAssistantGlow(false), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Assistant error.";
      setAssistantOutput(message);
      queueAutoTts(message);
      logEvent({ source: "assistant", level: "error", message });
      setAssistantGlow(true);
      setTimeout(() => setAssistantGlow(false), 1200);
    } finally {
      setAssistantRunning(false);
    }
  };

  const runSongAnalysis = async () => {
    if (!songAnalysisPrompt.trim()) {
      const message = "Enter an analysis prompt.";
      setSongAnalysisOutput(message);
      queueAutoTts(message);
      return;
    }
    setSongAnalysisRunning(true);
    setSongAnalysisOutput("");
    try {
      const composed = `You are a hyper-advanced song analyst. Evaluate structure, groove, harmony, rhythm, mix, vocals/lyrics, and commercial viability. Provide crisp bullet points with fixes.
Audio URL (if provided): ${songAnalysisUrl || "none"}
Transcription (if available): ${voiceResult || "none"}
User prompt: ${songAnalysisPrompt}`;
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "groq/compound",
          prompt: composed,
          temperature: 0.35,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || `Analysis failed: ${res.status}`);
      const output = data.output || "Analysis completed.";
      setSongAnalysisOutput(output);
      queueAutoTts(output);
      logEvent({ source: "song-analysis", level: "info", message: "Song analysis OK" });
      setSongAnalysisGlow(true);
      setTimeout(() => setSongAnalysisGlow(false), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Song analysis error.";
      setSongAnalysisOutput(message);
      queueAutoTts(message);
      logEvent({ source: "song-analysis", level: "error", message });
      setSongAnalysisGlow(true);
      setTimeout(() => setSongAnalysisGlow(false), 1200);
    } finally {
      setSongAnalysisRunning(false);
    }
  };

  const improveField = async (key: string, text: string, setter: (v: string) => void, context: string) => {
    const content = text.trim();
    if (!content) return;
    setAiImproving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch("/api/groq-compound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "groq/compound",
          prompt: `Polish and improve this ${context}. Keep it concise, actionable, and preserve key details.\n\n${content}`,
          temperature: 0.35,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || `Improve failed: ${res.status}`);
      const improved = data.output || content;
      setter(improved);
      queueAutoTts(improved);
      logEvent({ source: "ai-improve", level: "info", message: `${context} improved` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Improve error.";
      logEvent({ source: "ai-improve", level: "error", message });
    } finally {
      setAiImproving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const triggerSunoGlow = () => {
    setSunoGlow(true);
    setTimeout(() => setSunoGlow(false), 1200);
  };

  const runSuno = async () => {
    const brief = sunoPrompt.trim();
    if (!brief) {
      const message = "Enter a Suno music brief.";
      setSunoError(message);
      queueAutoTts(message);
      return;
    }
    setSunoRunning(true);
    setSunoError("");
    try {
      const res = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: brief,
          model: sunoModel,
          customMode: sunoCustomMode,
          instrumental: sunoInstrumental,
          style: sunoStyle,
          title: sunoTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || `Suno request failed: ${res.status}`);
      const taskId = data?.taskId || data?.data?.taskId || data?.data?.task_id || "";
      setSunoTaskId(taskId);
      setSunoStatus("queued");
      queueAutoTts("Suno status: queued.");
      setSunoTracks([]);
      logEvent({ source: "suno", level: "info", message: `Suno task started: ${taskId || "unknown"}` });
      triggerSunoGlow();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Suno generation error.";
      setSunoError(message);
      queueAutoTts(message);
      logEvent({ source: "suno", level: "error", message });
      triggerSunoGlow();
    } finally {
      setSunoRunning(false);
    }
  };

  const pollSuno = async () => {
    if (!sunoTaskId) {
      const message = "Start a Suno job to get a task ID first.";
      setSunoError(message);
      queueAutoTts(message);
      return;
    }
    setSunoPolling(true);
    setSunoError("");
    try {
      const res = await fetch(`/api/suno/status?taskId=${encodeURIComponent(sunoTaskId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || `Suno status failed: ${res.status}`);
      const status = data?.status || data?.data?.status || "unknown";
      setSunoStatus(status);
      queueAutoTts(`Suno status: ${status}.`);
      const tracks: SunoTrack[] = Array.isArray(data?.tracks)
        ? data.tracks
        : Array.isArray(data?.data?.response?.data)
          ? data.data.response.data
          : [];
      if (tracks.length) {
        setSunoTracks(tracks);
      }
      logEvent({ source: "suno", level: status === "SUCCESS" ? "info" : "info", message: `Suno status: ${status}` });
      triggerSunoGlow();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Suno status error.";
      setSunoError(message);
      queueAutoTts(message);
      logEvent({ source: "suno", level: "error", message });
      triggerSunoGlow();
    } finally {
      setSunoPolling(false);
    }
  };

  const applyAssistantActions = (actions: unknown[]) => {
    if (!Array.isArray(actions)) return ["No actions to apply."];
    let nextProjects = projects;
    let nextTasks = tasks;
    let nextNotes = notes;
    const summaries: string[] = [];
    let changed = false;

    actions.forEach((action) => {
      if (!action || typeof action !== "object") return;
      const type = (action as { type?: string }).type;
      switch (type) {
        case "add_project": {
          const a = action as { name?: string; status?: string; owner?: string };
          if (!a.name) break;
          nextProjects = [
            ...nextProjects,
            {
              id: newId("p"),
              name: a.name,
              client: "Agent",
              status: (a.status as string) || "Planned",
              owner: a.owner || "Agent",
            },
          ];
          summaries.push(`Added project: ${a.name}`);
          changed = true;
          break;
        }
        case "add_task": {
          const a = action as { title?: string; status?: string; assignee?: string; due?: string; project?: string };
          if (!a.title) break;
          nextTasks = [
            ...nextTasks,
            {
              id: newId("t"),
              title: a.title,
              project: a.project || "Unassigned",
              status: (a.status as string) || "Todo",
              due: a.due || "",
              owner: a.assignee || "Agent",
            },
          ];
          summaries.push(`Added task: ${a.title}`);
          changed = true;
          break;
        }
        case "add_note": {
          const a = action as { title?: string; content?: string; reference?: string };
          if (!a.title) break;
          nextNotes = [
            ...nextNotes,
            {
              id: newId("n"),
              title: a.title,
              content: a.content || "",
              reference: a.reference || "",
            },
          ];
          summaries.push(`Added note: ${a.title}`);
          changed = true;
          break;
        }
        case "add_event": {
          const a = action as { title?: string; date?: string; time?: string; owner?: string };
          if (!a.title) break;
          nextTasks = [
            ...nextTasks,
            {
              id: newId("evt"),
              title: a.title,
              project: "Event",
              status: "Todo",
              due: a.date || "",
              owner: a.owner || "Agent",
            },
          ];
          summaries.push(`Added event: ${a.title}${a.date ? ` on ${a.date}` : ""}`);
          changed = true;
          break;
        }
        default:
          summaries.push(`Skipped action type: ${String(type || "unknown")}`);
      }
    });

    if (changed) {
      setProjects(nextProjects);
      setTasks(nextTasks);
      setNotes(nextNotes);
      void persistDashboard({ projects: nextProjects, tasks: nextTasks, notes: nextNotes });
    }

    return summaries.length ? summaries : ["No recognized actions applied."];
  };

  const toggleTaskChecked = (taskId: string) => {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleTaskSwitch = (taskId: string) => {
    setIsClockedOut(false);
    setTrackedTaskId(taskId);
    lastActivityRef.current = Date.now();
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (!trackedTaskId) return;
    intervalRef.current = setInterval(() => {
      setTimeSpent((prev) => ({
        ...prev,
        [trackedTaskId]: (prev[trackedTaskId] ?? 0) + 1,
      }));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trackedTaskId]);

  const compileStoryboard = async () => {
    if (!storyClips.length) {
      const message = "Add clips before compiling.";
      setCompileOutput(message);
      queueAutoTts(message);
      return;
    }
    setCompileRunning(true);
    setCompileOutput("");
    setCompileUrl("");
    try {
      const res = await fetch("/api/video/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clips: storyClips.map((c) => ({
            id: c.id,
            url: c.mediaUrl,
            start: c.start,
            end: c.end,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Compile failed: ${res.status}`);
      setCompileUrl(data.dataUrl || "");
      const fileName = data.fileName || "storyboard-compiled.mp4";
      const output = `Compiled video ready${fileName ? `: ${fileName}` : ""}.`;
      setCompileOutput(output);
      queueAutoTts(output);
      logEvent({ source: "compile", level: "info", message: "Storyboard compiled" });
      setCompileGlow(true);
      setTimeout(() => setCompileGlow(false), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Compile failed.";
      setCompileOutput(message);
      queueAutoTts(message);
      logEvent({ source: "compile", level: "error", message });
      setCompileGlow(true);
      setTimeout(() => setCompileGlow(false), 1200);
    } finally {
      setCompileRunning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, markActivity));
    return () => {
      events.forEach((event) => window.removeEventListener(event, markActivity));
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      videoObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  useEffect(() => {
    if (!autoTtsEnabled) {
      stopAutoTts();
    }
  }, [autoTtsEnabled, stopAutoTts]);

  useEffect(() => {
    return () => {
      stopAutoTts();
    };
  }, [stopAutoTts]);

  useEffect(() => {
    setTimeSpent((prev) => {
      const next = { ...prev };
      tasks.forEach((task) => {
        if (next[task.id] === undefined) next[task.id] = 0;
      });
      return next;
    });
  }, [tasks]);

  useEffect(() => {
    if (!tasks.length) {
      if (trackedTaskId !== null) {
        setTrackedTaskId(null);
      }
      return;
    }
    if (isClockedOut) return;
    const stillExists = trackedTaskId ? tasks.some((task) => task.id === trackedTaskId) : false;
    const nextId = stillExists ? trackedTaskId : tasks[0].id;
    if (nextId !== trackedTaskId) {
      setTrackedTaskId(nextId);
    }
  }, [tasks, trackedTaskId, isClockedOut]);

  useEffect(() => {
    if (inactivityIntervalRef.current) {
      clearInterval(inactivityIntervalRef.current);
    }
    if (!trackedTaskId) return;
    inactivityIntervalRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT_MS) {
        setTrackedTaskId(null);
        setIsClockedOut(true);
      }
    }, 30000);
    return () => {
      if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current);
    };
  }, [trackedTaskId]);

  // Auto-add overlay AI Gen buttons to every text field.
  useEffect(() => {
    const targetSelector =
      'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([type="button"]):not([type="submit"]):not([type="color"]):not([type="hidden"]), textarea';
    const buttons = new Map<HTMLInputElement | HTMLTextAreaElement, HTMLButtonElement>();
    const paddingRight = 68;
    const buttonWidth = 60;
    const buttonHeight = 22;

    const makeSuggestion = (field: HTMLInputElement | HTMLTextAreaElement) => {
      const placeholder = field.getAttribute("placeholder")?.trim();
      const label = placeholder || field.getAttribute("name") || "content";
      if (field instanceof HTMLInputElement) {
        const type = field.type;
        if (type === "email") return "ai-team@example.com";
        if (type === "url") return "https://example.com/ai-generated";
        if (type === "date") return new Date().toISOString().slice(0, 10);
        if (type === "number") {
          if (label && /bpm/i.test(label)) return "95";
          if (label && /(hour|rate|tasks)/i.test(label)) return "40";
          return "42";
        }
      }
      if (field instanceof HTMLTextAreaElement) {
        return `AI-drafted ${label.toLowerCase()}`;
      }
      return `AI suggestion for ${label.toLowerCase()}`;
    };

    const applyValue = (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
      const prototype = Object.getPrototypeOf(field);
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      if (setter) {
        setter.call(field, value);
      } else {
        field.value = value;
      }
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const positionButton = (field: HTMLInputElement | HTMLTextAreaElement, button: HTMLButtonElement) => {
      const parent = field.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      const fieldRect = field.getBoundingClientRect();
      const top = fieldRect.top - parentRect.top + fieldRect.height / 2 - buttonHeight / 2;
      const left = fieldRect.left - parentRect.left + fieldRect.width - buttonWidth - 4;
      button.style.top = `${Math.max(top, 0)}px`;
      button.style.left = `${left}px`;
    };

    const attach = (node: Element) => {
      if (!(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)) return;
      if (buttons.has(node)) return;
      if (node instanceof HTMLInputElement) {
        const skipTypes = ["checkbox", "radio", "range", "file", "button", "submit", "color", "hidden"];
        if (skipTypes.includes(node.type)) return;
      }
      if (node.disabled || node.readOnly) return;
      const parent = node.parentElement;
      if (!parent) return;
      if (getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "AI Gen/Improve";
      button.className =
        "ai-gen-button rounded-full border border-emerald-400/60 bg-emerald-500/15 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-emerald-100 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-500/25";
      button.style.position = "absolute";
      button.style.height = `${buttonHeight}px`;
      button.style.minWidth = `${buttonWidth}px`;
      button.style.display = "inline-flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.zIndex = "20";
      const currentPadding = parseFloat(getComputedStyle(node).paddingRight || "0");
      if (currentPadding < paddingRight) {
        node.style.paddingRight = `${paddingRight}px`;
      }
      button.addEventListener("click", async () => {
        const existing = (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement ? node.value : "").trim();
        const useImprove = Boolean(existing);
        const labelRestore = "AI Gen/Improve";
        const workingLabel = useImprove ? "Improving..." : "Generating...";
        try {
          button.disabled = true;
          button.textContent = workingLabel;
          if (useImprove) {
            const res = await fetch("/api/groq-compound", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "groq/compound",
                prompt: `Polish and improve this text. Keep it concise, actionable, and preserve intent.\n\n${existing}`,
                temperature: 0.35,
              }),
            });
            const data = await res.json();
            const improved = res.ok ? data.output || existing : existing;
            applyValue(node, improved);
          } else {
            const suggestion = makeSuggestion(node);
            applyValue(node, suggestion);
          }
          button.classList.add("animate-pulse");
          setTimeout(() => button.classList.remove("animate-pulse"), 300);
        } catch {
          // Silent fail; keep current value.
        } finally {
          button.disabled = false;
          button.textContent = labelRestore;
        }
      });
      parent.appendChild(button);
      buttons.set(node, button);
      positionButton(node, button);
    };

    const positionAll = () => {
      buttons.forEach((button, field) => {
        if (!field.isConnected) {
          button.remove();
          buttons.delete(field);
          return;
        }
        positionButton(field, button);
      });
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          attach(node);
          node.querySelectorAll?.(targetSelector).forEach((child) => attach(child));
        });
        mutation.removedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
            const button = buttons.get(node);
            if (button) {
              button.remove();
              buttons.delete(node);
            }
          }
          node.querySelectorAll?.(targetSelector).forEach((child) => {
            if (child instanceof HTMLInputElement || child instanceof HTMLTextAreaElement) {
              const button = buttons.get(child);
              if (button) {
                button.remove();
                buttons.delete(child);
              }
            }
          });
        });
      });
      requestAnimationFrame(positionAll);
    });

    document.querySelectorAll(targetSelector).forEach((node) => attach(node));
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", positionAll);
    window.addEventListener("scroll", positionAll, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", positionAll);
      window.removeEventListener("scroll", positionAll, true);
      buttons.forEach((button) => button.remove());
      buttons.clear();
    };
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <div
        className="mx-auto flex min-h-screen max-w-5xl flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
        }}
      >
        {dbHealth && dbHealth.status !== "ok" && (
          <div
            className={`rounded-xl border px-3 py-2 text-sm ${
              dbHealth.status === "full" ? "border-rose-500/60 bg-rose-500/10 text-rose-100" : "border-amber-400/60 bg-amber-500/10 text-amber-100"
            }`}
          >
            DB space warning: {dbHealth.percent}% used ({(dbHealth.sizeBytes / (1024 * 1024)).toFixed(1)}MB /
            {(dbHealth.thresholdBytes / (1024 * 1024)).toFixed(1)}MB). Consider pruning data or migrating to Postgres to avoid write failures.
          </div>
        )}
        {dbHealthError && (
          <div className="rounded-xl border border-amber-400/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            DB health check failed: {dbHealthError}
          </div>
        )}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">iLLCo Ai - ChatOps Workspace</h1>
          <p className="text-sm text-slate-300">
            Single-frame chatbot that drives tasks, workstations, docs, and Groq/E2B sandboxes. Spreadsheet-like, phone-friendly, and fully controllable from the chat bar.
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          <aside className="flex w-full flex-col gap-3 lg:max-w-[280px]">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Task list</p>
              <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
                {tasks.map((task) => {
                  const isActive = trackedTaskId === task.id;
                  const isClaimable = !task.owner;
                  const isMine = task.owner && agents.find((a) => a.id === activeAgentId)?.name === task.owner;
                  return (
                    <div key={task.id} className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-2 py-2 hover:border-white/20">
                      <input
                        type="checkbox"
                        checked={checkedTasks.has(task.id)}
                        onChange={() => toggleTaskChecked(task.id)}
                        className="accent-emerald-400"
                      />
                      <div className="flex-1 text-left text-[13px]">
                        <p className="font-semibold leading-tight">{task.title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span>{task.project || "Unassigned"}</span>
                          <span className={`rounded-full border px-1.5 py-0.5 ${isClaimable ? "border-amber-400/60 text-amber-200" : "border-white/15 text-slate-200"}`}>
                            {isClaimable ? "Claimable" : task.owner}
                          </span>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[11px] text-white"
                          >
                            <option value="Todo">Todo</option>
                            <option value="Doing">Doing</option>
                            <option value="Blocked">Blocked</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => handleTaskSwitch(task.id)}
                          className={`w-[68px] rounded-full border px-2 py-0.5 text-[10px] ${isActive ? "border-emerald-400 text-emerald-300" : "border-white/20 text-slate-300"}`}
                        >
                          {isActive ? "Active" : "Switch"}
                        </button>
                        {isClaimable && (
                          <button
                            onClick={() => claimTask(task.id)}
                            className="w-[68px] rounded-full border border-amber-400/70 px-2 py-0.5 text-[10px] text-amber-200 hover:border-amber-300"
                          >
                            Claim
                          </button>
                        )}
                        {isActive && (
                          <button
                            onClick={() => {
                              setTrackedTaskId(null);
                              setIsClockedOut(true);
                        }}
                        className="w-[68px] rounded-full border border-rose-400/70 px-2 py-0.5 text-[10px] text-rose-200 hover:border-rose-300"
                      >
                        Clock out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
                {tasks.length === 0 && <p className="text-xs text-slate-500">Use the chat or forms to add tasks.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Auto time clock</p>
              <p className="mt-2 text-lg font-semibold">
                {trackedTaskId ? tasks.find((task) => task.id === trackedTaskId)?.title ?? "Working..." : isClockedOut ? "Clocked out" : "No task selected"}
              </p>
              <p className="text-xs text-slate-300">
                Time tracked: {trackedTaskId ? formatDuration(timeSpent[trackedTaskId] ?? 0) : "00:00"}
              </p>
              <p className="mt-2 text-[11px] text-slate-500">Switching tasks updates the active timer automatically.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Calendar</p>
              <div className="mt-2 space-y-2">
                {(calendarItems.length ? calendarItems.slice(0, 6) : [{ key: "empty", title: "No events yet", date: "TBD", time: "", owner: "" }]).map((entry) => (
                  <div key={entry.key} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      <span>{entry.date || "TBD"}</span>
                      <span>{entry.time}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">{entry.title}</p>
                    <p className="text-[11px] text-slate-400">{entry.owner ? `${entry.owner} - ${entry.tag}` : entry.tag}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Activity log</p>
                <span className="text-[11px] text-slate-500">{logs.length} entries</span>
              </div>
              <div className={`mt-2 h-48 overflow-y-auto rounded border border-white/10 bg-slate-900/60 px-2 py-2 text-[12px] font-mono ${logsGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                {logs.length ? (
                  logs.map((log, idx) => (
                    <p key={`${log.ts}-${idx}`} className={log.level === "error" ? "text-rose-200" : "text-slate-200"}>
                      <span className="text-slate-500">[{new Date(log.ts).toLocaleTimeString()}]</span>{" "}
                      <span className="text-emerald-300">{log.source}</span>: {log.message}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500">No log entries yet.</p>
                )}
              </div>
            </div>
          </aside>

          <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
            <div className="grid gap-2 border-b border-white/10 bg-slate-900/70 px-3 py-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Projects</p>
                <p className="text-xl font-semibold">{summary.projectCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Tasks</p>
                <p className="text-xl font-semibold">{summary.taskCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Notes</p>
                <p className="text-xl font-semibold">{summary.noteCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Agents</p>
                <p className="text-xl font-semibold">{summary.agentCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Workstations</p>
                <p className="text-xl font-semibold">{summary.workstationCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Due soon</p>
                <p className="text-xl font-semibold">{summary.dueSoon}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { key: "all", label: "All" },
                  { key: "chat", label: "Chat/E2B" },
                  { key: "e2b", label: "E2B IDE" },
                  { key: "data", label: "Data" },
                  { key: "crm", label: "CRM" },
                  { key: "eng", label: "GitHub" },
                  { key: "coder", label: "AI Coder" },
                  { key: "notes", label: "Notes" },
                  { key: "finance", label: "Finance" },
                  { key: "calendar", label: "Calendar" },
                  { key: "songwriter", label: "Songwriter" },
                  { key: "storyboard", label: "Storyboard" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMainTab(tab.key as typeof mainTab)}
                    className={`rounded-full border px-3 py-1 text-[11px] ${
                      mainTab === tab.key ? "border-emerald-400 text-emerald-200" : "border-white/20 text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => void fetchDashboard()}
                  disabled={dashboardLoading}
                  className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {dashboardLoading ? "Refreshing..." : "Refresh data"}
                </button>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-300">
                  <span>Project</span>
                  <input
                    value={projectContextName}
                    onChange={(e) => {
                      setProjectContextName(e.target.value);
                      if (projectContextError) setProjectContextError("");
                    }}
                    placeholder="Project name"
                    list="project-context-list"
                    className="w-36 rounded border border-white/20 bg-slate-950/70 px-2 py-1 text-[11px] normal-case tracking-normal text-slate-100"
                  />
                  <datalist id="project-context-list">
                    {projects.map((project) => (
                      <option key={project.id} value={project.name} />
                    ))}
                  </datalist>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-300">
                  <span>Auto TTS</span>
                  <button
                    onClick={() => setAutoTtsEnabled((prev) => !prev)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] ${
                      autoTtsEnabled ? "border-emerald-400/70 text-emerald-200" : "border-white/20 text-slate-200"
                    }`}
                  >
                    {autoTtsEnabled ? "On" : "Off"}
                  </button>
                  <button
                    onClick={stopAutoTts}
                    disabled={!autoTtsRunning}
                    className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-slate-200 disabled:opacity-50"
                  >
                    Stop
                  </button>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen((p) => !p)}
                    className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white transition hover:border-white/60"
                  >
                    Alerts {notifications.length ? `(${notifications.length})` : ""}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[80vw] rounded-xl border border-white/10 bg-slate-950/90 p-2 text-[12px] shadow-xl backdrop-blur">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Mentions</p>
                        <button
                          onClick={() => setNotifications([])}
                          className="text-[11px] text-emerald-200 underline"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="max-h-60 space-y-1 overflow-y-auto">
                        {notifications.length ? (
                          notifications.map((n) => (
                            <div key={n.id} className="rounded border border-emerald-400/30 bg-emerald-500/10 px-2 py-1">
                              <p className="text-emerald-100">{n.target} was tagged</p>
                              <p className="text-slate-200">{n.message}</p>
                              <p className="text-[10px] text-slate-400">{new Date(n.ts).toLocaleTimeString()}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500">No mentions yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {projectContextError && (
              <div className="mx-3 mb-2 rounded border border-rose-400/50 bg-rose-500/10 px-3 py-1 text-[11px] text-rose-200">
                {projectContextError}
              </div>
            )}

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {showTab("chat") && (
              <>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Task ticker</p>
                  <span className="text-[11px] text-slate-400">{tasks.length || 0} tasks</span>
                </div>
                <div className="mt-2 flex max-h-20 gap-2 overflow-x-auto whitespace-nowrap text-[11px]">
                  {[...tasks]
                    .sort((a, b) => (a.due && b.due ? a.due.localeCompare(b.due) : a.due ? -1 : 1))
                    .slice(0, 12)
                    .map((task) => {
                      const isUrgent = task.due && new Date(task.due).getTime() <= Date.now() + 1000 * 60 * 60 * 24;
                      const urgencyColor = isUrgent ? "from-rose-500/80 to-amber-500/60" : "from-sky-500/40 to-blue-500/20";
                      return (
                        <span
                          key={task.id}
                          className={`inline-flex items-center gap-2 rounded-full border border-white/5 bg-gradient-to-r ${urgencyColor} px-3 py-1 font-semibold text-white`}
                        >
                          {isUrgent ? "URGENT!!" : task.due ? new Date(task.due).toLocaleDateString() : "No due"}
                          <span className="text-[10px] text-slate-200">{task.title}</span>
                        </span>
                      );
                    })}
                  {tasks.length === 0 && <span className="text-xs text-slate-500">No tasks yet.</span>}
                </div>
              </div>
                  <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Chat console (Groq compound)</p>
                          <span className="text-[11px] text-slate-400">Schema: {"{ \"type\": \"object\", \"properties\": {} }"}</span>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-[1.05fr_1fr]">
                          <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Prompt</label>
                            <button
                              onClick={() => improveField("toolPrompt", toolPrompt, setToolPrompt, "chat prompt")}
                              disabled={aiImproving["toolPrompt"]}
                              className="text-[11px] text-emerald-300 underline"
                            >
                              {aiImproving["toolPrompt"] ? "Improving..." : "AI improve"}
                            </button>
                            <select
                          onChange={(event) => {
                            const val = event.target.value;
                            if (val) setToolPrompt(val);
                          }}
                          className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm text-white"
                          defaultValue=""
                        >
                          <option value="">Choose saved prompt</option>
                          {promptLibrary.map((p) => (
                            <option key={p.id} value={p.text}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={toolPrompt}
                          onChange={(event) => setToolPrompt(event.target.value)}
                          rows={8}
                          className="w-full rounded border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-emerald-400"
                          placeholder="Command iLLCo Ai, request an agent, or ask for a quick summary..."
                        />
                        <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Temp</span>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={toolTemperature}
                              onChange={(e) => setToolTemperature(Number(e.target.value))}
                              className="w-28"
                            />
                            <span className="text-white">{toolTemperature.toFixed(2)}</span>
                          </div>
                          <button
                            onClick={runGroqCompoundTool}
                            disabled={toolRunning}
                            className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300"
                          >
                            {toolRunning ? "Working..." : "Send"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Assistant output</p>
                          <button
                            onClick={saveChatOutput}
                            className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                          >
                            Save
                          </button>
                        </div>
                        <div className={`mt-2 h-64 overflow-y-auto rounded border border-white/5 bg-black/30 px-2 py-2 text-[12px] ${chatGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                          {chatHistory.length ? (
                            chatHistory.map((turn, idx) => (
                              <p key={`${turn.role}-${idx}`} className="mb-1">
                                <span className="font-semibold text-slate-200">{turn.role === "user" ? "You" : "Assistant"}:</span>{" "}
                                <span className="text-slate-100">{turn.content}</span>
                              </p>
                            ))
                          ) : toolOutput ? (
                            toolOutput.split("\n").map((line, idx) => <p key={idx}>{line}</p>)
                          ) : (
                            <p className="text-slate-400">Streaming results appear here.</p>
                          )}
                        </div>
                      </div>
                </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0b1221] text-sm shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <p className="ml-2 font-mono text-xs text-slate-200">E2B Code • VS-like console</p>
                      </div>
                      <select
                        value={e2bModel}
                        onChange={(e) => setE2bModel(e.target.value)}
                        className="rounded border border-white/20 bg-slate-900/80 px-2 py-1 text-[12px]"
                      >
                        <option value="groq/compound">groq/compound</option>
                        <option value="groq/compound-mini">groq/compound-mini</option>
                        <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
                        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                        <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
                        <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
                        <option value="meta-llama/llama-guard-4-12b">meta-llama/llama-guard-4-12b</option>
                      </select>
                    </div>
                    <div className="grid gap-3 border-b border-white/10 bg-[#0f172a] px-3 py-3 md:grid-cols-[1.1fr_0.9fr]">
                      <div className="space-y-2">
                        <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Prompt</label>
                        <button
                          onClick={() => improveField("e2bPrompt", e2bPrompt, setE2bPrompt, "E2B prompt")}
                          disabled={aiImproving["e2bPrompt"]}
                          className="text-[11px] text-emerald-300 underline"
                        >
                          {aiImproving["e2bPrompt"] ? "Improving..." : "AI improve"}
                        </button>
                        <textarea
                          value={e2bPrompt}
                          onChange={(e) => setE2bPrompt(e.target.value)}
                          rows={4}
                          className="w-full rounded border border-white/10 bg-[#0b1221] px-3 py-2 font-mono text-[12px] text-white shadow-inner"
                          placeholder="Describe what to run..."
                        />
                        <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Code (optional override)</label>
                        <button
                          onClick={() => improveField("e2bCode", e2bCode, setE2bCode, "code snippet")}
                          disabled={aiImproving["e2bCode"]}
                          className="text-[11px] text-emerald-300 underline"
                        >
                          {aiImproving["e2bCode"] ? "Improving..." : "AI improve"}
                        </button>
                        <textarea
                          value={e2bCode}
                          onChange={(e) => setE2bCode(e.target.value)}
                          rows={6}
                          className="w-full rounded border border-white/10 bg-[#0b1221] px-3 py-2 font-mono text-[12px] text-white shadow-inner"
                          placeholder="Paste code to run, or leave blank to let Groq generate."
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={runE2b}
                            disabled={e2bRunning}
                            className="rounded border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300"
                          >
                            {e2bRunning ? "Running..." : "Run in E2B"}
                          </button>
                          <span className="font-mono text-[11px] text-slate-400">Requires GROQ_API_KEY + E2B_API_KEY</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Terminal</p>
                          <button
                            onClick={saveE2bOutput}
                            className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                          >
                            Save
                          </button>
                        </div>
                        <div className={`h-48 overflow-y-auto rounded border border-slate-800 bg-[#0b0f1d] px-3 py-2 font-mono text-[12px] text-emerald-200 ${e2bGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                          {e2bHistory.length ? (
                            e2bHistory.map((turn, idx) => (
                              <p key={`${turn.role}-${idx}`} className="mb-1">
                                <span className="text-slate-500">[{turn.role === "user" ? "input" : "output"}]</span>{" "}
                                <span>{turn.content}</span>
                              </p>
                            ))
                          ) : e2bOutput ? (
                            e2bOutput.split("\n").map((line, idx) => <p key={idx}>{line}</p>)
                          ) : (
                            <p className="text-slate-500">Execution logs appear here.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Dynamic data outputs</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {(calendarItems.length ? calendarItems.slice(0, 2) : [{ key: "dyn-empty", title: "No upcoming items", date: "TBD", time: "", owner: "" }]).map((entry) => (
                        <div key={entry.key} className="rounded border border-white/10 bg-slate-900/60 px-2 py-2 text-[12px]">
                          <p className="font-semibold text-white">{entry.title}</p>
                          <p className="text-[11px] text-slate-400">
                            {entry.date}
                            {entry.time ? ` @ ${entry.time}` : ""}
                          </p>
                          <p className="text-[11px] text-slate-500">{entry.owner || "Unassigned"}</p>
                        </div>
                      ))}
                      <div className="rounded border border-white/10 bg-slate-900/60 px-2 py-2 text-[12px]">
                        <p className="font-semibold text-white">Personal agents</p>
                        <p className="text-[11px] text-slate-400">
                          Each teammate has a personal Groq-powered agent (iLL, Cody, Ad, Mcdaniel, Bill) plus Nova the agent-builder. Use the chat to direct them.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Calendar</p>
                      <span className="text-[11px] text-slate-500">{calendarItems.length || 0} items</span>
                    </div>
                    <div className="mt-2 overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                      <table className="min-w-full text-left text-[12px]">
                        <thead className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                          <tr>
                            <th className="px-2 py-2">Date</th>
                            <th className="px-2 py-2">Time</th>
                            <th className="px-2 py-2">Title</th>
                            <th className="px-2 py-2">Owner</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(calendarItems.length ? calendarItems : [{ key: "cal-empty", title: "No events yet", date: "TBD", time: "", owner: "" }]).map((entry) => (
                            <tr key={entry.key} className="border-t border-white/5">
                              <td className="px-2 py-2 text-slate-200">{entry.date || "TBD"}</td>
                              <td className="px-2 py-2 text-slate-300">{entry.time || "—"}</td>
                              <td className="px-2 py-2 text-white">{entry.title}</td>
                              <td className="px-2 py-2 text-slate-300">{entry.owner || "Unassigned"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Prompt library</p>
                      <span className="text-[11px] text-slate-500">Tap to fill chat</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {promptLibrary.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={() => {
                            setToolPrompt(prompt.text);
                            setWorkstationInstruction(prompt.text);
                          }}
                          className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] text-white hover:border-white/40"
                        >
                          {prompt.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2">
                      <input
                        value={newPromptLabel}
                        onChange={(event) => setNewPromptLabel(event.target.value)}
                        placeholder="Label"
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                      />
                      <textarea
                        value={newPromptText}
                        onChange={(event) => setNewPromptText(event.target.value)}
                        rows={2}
                        placeholder="Prompt text"
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                      />
                      <button onClick={addPrompt} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">
                        Save prompt
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">API docs</p>
                    <div className="mt-2 space-y-2 text-[13px]">
                      {apiDocs.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start justify-between rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 hover:border-white/30"
                        >
                          <div>
                            <p className="font-semibold text-white">{doc.title}</p>
                            <p className="text-[11px] text-slate-400">{doc.description}</p>
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">open</span>
                        </a>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2">
                      <input
                        value={newDocTitle}
                        onChange={(event) => setNewDocTitle(event.target.value)}
                        placeholder="Doc title"
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                      />
                      <input
                        value={newDocUrl}
                        onChange={(event) => setNewDocUrl(event.target.value)}
                        placeholder="URL"
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                      />
                      <textarea
                        value={newDocDescription}
                        onChange={(event) => setNewDocDescription(event.target.value)}
                        rows={2}
                        placeholder="Description"
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                      />
                      <button onClick={addApiDoc} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">
                        Save doc
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">E2B sandbox and Groq</p>
                    <p className="text-[12px] text-slate-300">
                      Groq key: <code className="text-emerald-200">GROQ_API_KEY</code> | E2B key: <code className="text-emerald-200">E2B_API_KEY</code>. Runs secure code interpreter sessions.
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] text-slate-300">
                      <li>Install: <code className="text-emerald-200">pip install groq e2b-code-interpreter python-dotenv</code></li>
                      <li>Use <code className="text-emerald-200">Sandbox().run_code()</code> to execute generated code safely.</li>
                      <li>Chat here to trigger Groq compound with code interpreter tool enabled.</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Future workspace structure</p>
                    <div className="mt-2 grid gap-2 text-[12px]">
                      <div className="rounded border border-white/10 bg-slate-900/60 px-2 py-2">
                        <p className="font-semibold text-white">Core Data (tables)</p>
                        <p className="text-slate-400">People, Projects, Tasks, Deliverables, Interactions, Services, Quotes.</p>
                      </div>
                      <div className="rounded border border-white/10 bg-slate-900/60 px-2 py-2">
                        <p className="font-semibold text-white">Docs</p>
                        <p className="text-slate-400">Markdown/HTML knowledge pages linked by IDs.</p>
                      </div>
                      <div className="rounded border border-white/10 bg-slate-900/60 px-2 py-2">
                        <p className="font-semibold text-white">Files</p>
                        <p className="text-slate-400">Assets with storage paths and linked records.</p>
                      </div>
                      <div className="rounded border border-white/10 bg-slate-900/60 px-2 py-2">
                        <p className="font-semibold text-white">Admin</p>
                        <p className="text-slate-400">ID maps, schema registry, relation map.</p>
                      </div>
                      <div className="rounded border border-white/10 bg-slate-900/60 px-2 py-2">
                        <p className="font-semibold text-white">Archive</p>
                        <p className="text-slate-400">Frozen exports with date and format.</p>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Agents are equipped with Notion-style tools: pages, databases, views, properties, comments, mentions, search, import/export, automations, and buttons.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Personal Assistant</p>
                      <span className="text-[11px] text-slate-400">Groq /api/assistant</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Prompt</label>
                      <button
                        onClick={() => improveField("assistantPrompt", assistantPrompt, setAssistantPrompt, "assistant prompt")}
                        disabled={aiImproving["assistantPrompt"]}
                        className="text-[11px] text-emerald-300 underline"
                      >
                        {aiImproving["assistantPrompt"] ? "Improving..." : "AI improve"}
                      </button>
                      <textarea
                        value={assistantPrompt}
                        onChange={(e) => setAssistantPrompt(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-2 text-sm"
                        placeholder="Ask the personal assistant to summarize, plan, or apply actions..."
                      />
                      <button
                        onClick={runAssistant}
                        disabled={assistantRunning}
                        className="w-full rounded border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300"
                      >
                        {assistantRunning ? "Thinking..." : "Send to assistant"}
                      </button>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Output</p>
                        <button
                          onClick={() =>
                            saveProjectEntry(
                              "Assistant output",
                              buildSavePayload({ prompt: assistantPrompt, output: assistantOutput }),
                              formatSaveTitle(assistantPrompt, "Assistant output"),
                            )
                          }
                          className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                        >
                          Save
                        </button>
                      </div>
                      <div className={`min-h-20 rounded border border-white/10 bg-slate-900/60 p-2 text-[12px] text-slate-100 ${assistantGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                        {assistantOutput || "Assistant output will appear here."}
                      </div>
                      <p className="text-[11px] text-slate-400">Responds in JSON; applies actions to projects/tasks/notes when provided.</p>
                    </div>
                  </div>
                </div>
              </div>
              </>
              )}
              {showTab("e2b") && (
                <div className="grid gap-3 lg:grid-cols-[1.05fr_1.2fr]">
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0b1221] p-3 text-sm shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <p className="ml-2 font-mono text-xs text-slate-200">E2B IDE • VS Code style</p>
                      </div>
                      <select
                        value={e2bModel}
                        onChange={(e) => setE2bModel(e.target.value)}
                        className="rounded border border-white/20 bg-slate-900/80 px-2 py-1 text-[12px]"
                      >
                        <option value="groq/compound">groq/compound</option>
                        <option value="groq/compound-mini">groq/compound-mini</option>
                        <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
                        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                        <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
                        <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
                        <option value="meta-llama/llama-guard-4-12b">meta-llama/llama-guard-4-12b</option>
                      </select>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[0.6fr_1.4fr]">
                      <div className="space-y-2 rounded border border-white/10 bg-[#0f172a] p-2">
                        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Explorer</p>
                        <div className="max-h-72 space-y-1 overflow-y-auto rounded border border-white/10 bg-[#0b1221] p-2 text-[12px]">
                          {e2bWorkspaceFiles.map((f) => (
                            <div key={f.path} className="flex items-center gap-2 text-slate-200">
                              <span className="text-slate-500">{f.type === "folder" ? "📁" : "📄"}</span>
                              <span className="truncate">{f.path}</span>
                              <span className="ml-auto text-[11px] text-slate-500">{f.language ? f.language.toUpperCase() : ""}{f.size ? ` · ${f.size}` : ""}</span>
                            </div>
                          ))}
                        </div>
                        <div className="rounded border border-white/10 bg-[#0b1221] p-2 text-[12px] text-slate-300">
                          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Shortcuts</p>
                          <p>Run: Ctrl/Cmd + Enter</p>
                          <p>Reset prompt/code: clear fields</p>
                          <p>History: scroll terminal</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2 rounded border border-white/10 bg-[#0f172a] p-3">
                          <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Prompt</label>
                          <textarea
                            value={e2bPrompt}
                            onChange={(e) => setE2bPrompt(e.target.value)}
                            rows={4}
                            className="w-full rounded border border-white/10 bg-[#0b1221] px-3 py-2 font-mono text-[12px] text-white shadow-inner"
                            placeholder="Describe what to run in the workspace..."
                          />
                          <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Code (optional override)</label>
                          <textarea
                            value={e2bCode}
                            onChange={(e) => setE2bCode(e.target.value)}
                            rows={8}
                            className="w-full rounded border border-white/10 bg-[#0b1221] px-3 py-2 font-mono text-[12px] text-white shadow-inner"
                            placeholder="Paste code to run, or leave blank to let Groq generate."
                          />
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={runE2b}
                              disabled={e2bRunning}
                              className="rounded border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300"
                            >
                              {e2bRunning ? "Running..." : "Run in E2B"}
                            </button>
                            <span className="font-mono text-[11px] text-slate-400">Requires GROQ_API_KEY + E2B_API_KEY</span>
                          </div>
                        </div>
                        <div className={`space-y-2 rounded border border-white/10 bg-[#0f172a] p-3 ${e2bGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">Terminal</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={saveE2bOutput}
                                className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                              >
                                Save
                              </button>
                              <p className="font-mono text-[11px] text-slate-500">History: {e2bHistory.length}</p>
                            </div>
                          </div>
                          <div className="h-60 overflow-y-auto rounded border border-slate-800 bg-[#0b0f1d] px-3 py-2 font-mono text-[12px] text-emerald-200">
                            {e2bHistory.length ? (
                              e2bHistory.map((turn, idx) => (
                                <p key={`${turn.role}-${idx}`} className="mb-1">
                                  <span className="text-slate-500">[{turn.role === "user" ? "input" : "output"}]</span>{" "}
                                  <span>{turn.content}</span>
                                </p>
                              ))
                            ) : e2bOutput ? (
                              e2bOutput.split("\n").map((line, idx) => <p key={idx}>{line}</p>)
                            ) : (
                              <p className="text-slate-500">Results appear here.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Agent-select guidance</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="rounded border border-white/10 bg-slate-900/60 p-2">
                        <p className="text-[12px] font-semibold text-white">VS-like layout</p>
                        <p className="text-[12px] text-slate-400">Dedicated Explorer + terminal, mirroring VS Code for E2B runs.</p>
                      </div>
                      <div className="rounded border border-white/10 bg-slate-900/60 p-2">
                        <p className="text-[12px] font-semibold text-white">Auto agent routing</p>
                        <p className="text-[12px] text-slate-400">Groq handles prompt→code; E2B executes with sandboxed tools.</p>
                      </div>
                    </div>
                    <div className="rounded border border-white/10 bg-slate-900/60 p-2 text-[12px] text-slate-300">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tips</p>
                      <ul className="list-disc space-y-1 pl-4">
                        <li>Attach files by referencing their Explorer paths in your prompt.</li>
                        <li>Use the code override for exact scripts; leave blank to let the agent generate.</li>
                        <li>Outputs stream into the terminal; history is preserved per session.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {showTab("audio") && (
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className={`space-y-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm ${voiceGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Voice input (ASR/Translation)</p>
                      <span className="text-[11px] text-slate-400">{voiceModel}</span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                          className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                        />
                        <input
                          value={voiceUrl}
                          onChange={(e) => setVoiceUrl(e.target.value)}
                          placeholder="Or paste audio URL / data URL"
                          className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                        />
                        <input
                          value={voicePrompt}
                          onChange={(e) => setVoicePrompt(e.target.value)}
                          placeholder="Guidance prompt (optional)"
                          className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                        />
                        <div className="flex items-center gap-2 text-[12px]">
                          <select value={voiceModel} onChange={(e) => setVoiceModel(e.target.value)} className="rounded border border-white/20 bg-slate-900/60 px-2 py-1">
                            <option value="whisper-large-v3-turbo">whisper-large-v3-turbo</option>
                            <option value="whisper-large-v3">whisper-large-v3</option>
                          </select>
                          <input
                            value={voiceLang}
                            onChange={(e) => setVoiceLang(e.target.value)}
                            placeholder="Lang (ISO, optional)"
                            className="w-32 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                          />
                        </div>
                        <button
                          onClick={runTranscription}
                          disabled={voiceRunning}
                          className="w-full rounded border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300"
                        >
                          {voiceRunning ? "Transcribing..." : "Transcribe/translate"}
                        </button>
                      </div>
                      <div className="space-y-1 rounded border border-white/10 bg-slate-900/60 p-2 text-[12px]">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Transcript</p>
                          <button
                            onClick={() =>
                              saveProjectEntry(
                                "Transcript",
                                buildSavePayload({
                                  text: voiceResult,
                                  model: voiceModel,
                                  language: voiceLang,
                                  prompt: voicePrompt,
                                  sourceUrl: voiceUrl,
                                }),
                                formatSaveTitle(voicePrompt || voiceUrl, "Transcript"),
                                { model: voiceModel },
                              )
                            }
                            className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                          >
                            Save
                          </button>
                        </div>
                        <div className="h-44 overflow-y-auto whitespace-pre-wrap rounded border border-white/10 bg-slate-950/60 px-2 py-2 text-slate-100">
                          {voiceResult || "Upload audio or URL to see text here."}
                        </div>
                        <p className="text-[11px] text-slate-400">Models: whisper-large-v3(-turbo). File/URL accepted.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <div className={`space-y-2 rounded border border-white/10 bg-slate-900/60 p-2 ${ttsGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">TTS (Groq Speech)</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">{ttsModel}</span>
                          <button
                            onClick={() =>
                              saveProjectEntry(
                                "TTS script",
                                buildSavePayload({
                                  text: ttsInput,
                                  voice: ttsVoice,
                                  model: ttsModel,
                                  format: ttsFormat,
                                  speed: ttsSpeed,
                                  audioUrl: ttsUrl,
                                }),
                                formatSaveTitle(ttsInput, "TTS script"),
                                { model: ttsModel, voice: ttsVoice },
                              )
                            }
                            className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={ttsInput}
                        onChange={(e) => setTtsInput(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                        placeholder="Text to synthesize..."
                      />
                      <button
                        onClick={() => improveField("ttsInput", ttsInput, setTtsInput, "speech script")}
                        disabled={aiImproving["ttsInput"]}
                        className="text-[11px] text-emerald-300 underline"
                      >
                        {aiImproving["ttsInput"] ? "Improving..." : "AI improve"}
                      </button>
                      <div className="grid grid-cols-2 gap-2 text-[12px]">
                        <input value={ttsVoice} onChange={(e) => setTtsVoice(e.target.value)} placeholder="Voice (e.g., Fritz-PlayAI)" className="rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                        <select value={ttsFormat} onChange={(e) => setTtsFormat(e.target.value)} className="rounded border border-white/20 bg-slate-900/60 px-2 py-1">
                          <option value="mp3">mp3</option>
                          <option value="wav">wav</option>
                          <option value="ogg">ogg</option>
                          <option value="flac">flac</option>
                        </select>
                        <input
                          type="number"
                          min={0.5}
                          max={5}
                          step={0.1}
                          value={ttsSpeed}
                          onChange={(e) => setTtsSpeed(Number(e.target.value))}
                          placeholder="Speed (0.5-5)"
                          className="rounded border border-white/20 bg-slate-900/60 px-2 py-1"
                        />
                      </div>
                      <button
                        onClick={runTts}
                        disabled={ttsRunning}
                        className="w-full rounded border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300"
                      >
                        {ttsRunning ? "Generating audio..." : "Generate speech"}
                      </button>
                      <div className="space-y-1 rounded border border-white/10 bg-slate-950/60 p-2 text-[12px]">
                        {ttsUrl ? <audio controls src={ttsUrl} className="w-full" /> : <p className="text-slate-500">Audio will appear here.</p>}
                        <p className="text-[11px] text-slate-400">Uses Groq /audio/speech. Configure voice/model in backend as needed.</p>
                      </div>
                    </div>
                    <div className={`space-y-2 rounded border border-white/10 bg-slate-900/60 p-2 ${songAnalysisGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Song analysis (hyper advanced)</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={runSongAnalysis}
                            disabled={songAnalysisRunning}
                            className="rounded border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-100"
                          >
                            {songAnalysisRunning ? "Analyzing..." : "Analyze"}
                          </button>
                          <button
                            onClick={() =>
                              saveProjectEntry(
                                "Song analysis",
                                buildSavePayload({
                                  prompt: songAnalysisPrompt,
                                  audioUrl: songAnalysisUrl,
                                  transcription: voiceResult,
                                  output: songAnalysisOutput,
                                }),
                                formatSaveTitle(songAnalysisPrompt, "Song analysis"),
                              )
                            }
                            className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                      <input
                        value={songAnalysisUrl}
                        onChange={(e) => setSongAnalysisUrl(e.target.value)}
                        placeholder="Audio URL (optional, aids analysis)"
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                      />
                      <textarea
                        value={songAnalysisPrompt}
                        onChange={(e) => setSongAnalysisPrompt(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                        placeholder="What to focus on (mix, groove, emotion, structure, etc.)"
                      />
                      <button
                        onClick={() => improveField("songAnalysisPrompt", songAnalysisPrompt, setSongAnalysisPrompt, "song analysis brief")}
                        disabled={aiImproving["songAnalysisPrompt"]}
                        className="text-[11px] text-emerald-300 underline"
                      >
                        {aiImproving["songAnalysisPrompt"] ? "Improving..." : "AI improve"}
                      </button>
                      <div className="h-32 overflow-y-auto rounded border border-white/10 bg-slate-950/60 px-2 py-2 text-[12px] text-slate-100">
                        {songAnalysisOutput || "Results will appear here. Transcription (above) is injected if available."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {showTab("songwriter") && (
                <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Songwriting agent</p>
                      <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-300">
                        <label className="flex items-center gap-1">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Model</span>
                          <select
                            value={songwriterModel}
                            onChange={(e) => setSongwriterModel(e.target.value)}
                            className="rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                          >
                            <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                            <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
                            <option value="groq/compound">groq/compound</option>
                            <option value="groq/compound-mini">groq/compound-mini</option>
                          </select>
                        </label>
                        <label className="flex items-center gap-1">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Reasoning</span>
                          <select
                            value={songwriterReasoning}
                            onChange={(e) => setSongwriterReasoning(e.target.value as typeof songwriterReasoning)}
                            className="rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-[12px]"
                          >
                            <option value="none">None</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </label>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Prompt</label>
                        <button
                          onClick={() => improveField("songwriterPrompt", songwriterPrompt, setSongwriterPrompt, "songwriting brief")}
                          disabled={aiImproving["songwriterPrompt"]}
                          className="text-[11px] text-emerald-300 underline"
                        >
                          {aiImproving["songwriterPrompt"] ? "Improving..." : "AI improve"}
                        </button>
                        <textarea
                          value={songwriterPrompt}
                          onChange={(e) => setSongwriterPrompt(e.target.value)}
                          rows={4}
                          className="w-full rounded border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                          placeholder="Describe topic, POV, narrative arc, constraints..."
                        />
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                          <input value={songwriterGenre} onChange={(e) => setSongwriterGenre(e.target.value)} placeholder="Genre/style" className="rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                          <input value={songwriterKey} onChange={(e) => setSongwriterKey(e.target.value)} placeholder="Key (vibe)" className="rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                          <input type="number" value={songwriterBpm} onChange={(e) => setSongwriterBpm(Number(e.target.value))} placeholder="BPM" className="rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                          <input value={songwriterMood} onChange={(e) => setSongwriterMood(e.target.value)} placeholder="Mood" className="rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                          <select value={songwriterRhyme} onChange={(e) => setSongwriterRhyme(e.target.value)} className="rounded border border-white/20 bg-slate-900/60 px-2 py-1">
                            <option value="light">Rhyme: light</option>
                            <option value="medium">Rhyme: medium</option>
                            <option value="dense">Rhyme: dense</option>
                          </select>
                          <input type="number" value={songwriterSyllables} onChange={(e) => setSongwriterSyllables(Number(e.target.value))} placeholder="Syllables/line" className="rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                          <input value={songwriterStructure} onChange={(e) => setSongwriterStructure(e.target.value)} placeholder="Structure" className="col-span-2 rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                        </div>
                        <button
                          onClick={runSongwriter}
                          disabled={songwriterRunning}
                          className="w-full rounded border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300"
                        >
                          {songwriterRunning ? "Generating..." : "Generate song"}
                        </button>
                      </div>
                      <div className={`space-y-3 rounded border border-white/10 bg-slate-900/60 p-2 ${songwriterGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Raw output</p>
                          <button
                            onClick={() =>
                              saveProjectEntry(
                                "Songwriter output",
                                buildSavePayload({
                                  prompt: songwriterPrompt,
                                  genre: songwriterGenre,
                                  key: songwriterKey,
                                  bpm: songwriterBpm,
                                  mood: songwriterMood,
                                  structure: songwriterStructure,
                                  output: songwriterOutput,
                                }),
                                formatSaveTitle(songwriterPrompt, "Songwriter output"),
                                { model: songwriterModel },
                              )
                            }
                            className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                          >
                            Save
                          </button>
                        </div>
                        <div className="h-40 overflow-y-auto rounded border border-white/10 bg-slate-950/60 px-2 py-2 text-[12px]">
                          {songwriterOutput ? songwriterOutput.split("\n").map((line, idx) => <p key={idx}>{line}</p>) : <p className="text-slate-500">Lyrics will appear here.</p>}
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Sections</p>
                        <div className="h-40 overflow-y-auto rounded border border-white/10 bg-slate-950/60 px-2 py-2 text-[12px]">
                          {songwriterOutput
                            ? songwriterOutput.split(/\n\n+/).map((block, idx) => (
                                <div key={idx} className="mb-2 rounded border border-white/10 bg-slate-900/60 px-2 py-1">
                                  {block.split("\n").map((line, i) => (
                                    <p key={i}>{line}</p>
                                  ))}
                                </div>
                              ))
                            : <p className="text-slate-500">Sections split by blank lines will show here.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm ${sunoGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Suno music agent</p>
                        <p className="text-[12px] text-slate-400">Generates audio with streaming-ready output.</p>
                      </div>
                      <div className="space-y-1 text-[12px] text-right text-slate-300">
                        <p>Task: {sunoTaskId || "None"}</p>
                        <p>Status: <span className="font-semibold text-emerald-200">{sunoStatus || "Not started"}</span></p>
                        <button
                          onClick={() =>
                            saveProjectEntry(
                              "Suno output",
                              buildSavePayload({
                                prompt: sunoPrompt,
                                title: sunoTitle,
                                style: sunoStyle,
                                model: sunoModel,
                                instrumental: sunoInstrumental,
                                status: sunoStatus,
                                taskId: sunoTaskId,
                                tracks: sunoTracks,
                                error: sunoError,
                              }),
                              formatSaveTitle(sunoTitle || sunoPrompt, "Suno output"),
                            )
                          }
                          className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Prompt</label>
                        <textarea
                          value={sunoPrompt}
                          onChange={(e) => setSunoPrompt(e.target.value)}
                          rows={5}
                          className="w-full rounded border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                          placeholder="Describe the music you want (style, mood, vocals)..."
                        />
                        <button
                          onClick={() => improveField("sunoPrompt", sunoPrompt, setSunoPrompt, "Suno music brief")}
                          disabled={aiImproving["sunoPrompt"]}
                          className="text-[11px] text-emerald-300 underline"
                        >
                          {aiImproving["sunoPrompt"] ? "Improving..." : "AI improve"}
                        </button>
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                          <input value={sunoTitle} onChange={(e) => setSunoTitle(e.target.value)} placeholder="Title" className="rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                          <input value={sunoStyle} onChange={(e) => setSunoStyle(e.target.value)} placeholder="Style/genre" className="rounded border border-white/20 bg-slate-900/60 px-2 py-1" />
                          <label className="flex items-center gap-2 rounded border border-white/20 bg-slate-900/60 px-2 py-1">
                            <input type="checkbox" checked={sunoCustomMode} onChange={(e) => setSunoCustomMode(e.target.checked)} />
                            <span>Custom mode</span>
                          </label>
                          <label className="flex items-center gap-2 rounded border border-white/20 bg-slate-900/60 px-2 py-1">
                            <input type="checkbox" checked={sunoInstrumental} onChange={(e) => setSunoInstrumental(e.target.checked)} />
                            <span>Instrumental only</span>
                          </label>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[12px]">
                          <label className="flex items-center gap-2">
                            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Model</span>
                            <select
                              value={sunoModel}
                              onChange={(e) => setSunoModel(e.target.value)}
                              className="rounded border border-white/20 bg-slate-900/60 px-2 py-1"
                            >
                              <option value="V5">V5 (latest)</option>
                              <option value="V4_5PLUS">V4_5PLUS</option>
                              <option value="V4_5ALL">V4_5ALL</option>
                              <option value="V4_5">V4_5</option>
                              <option value="V4">V4</option>
                            </select>
                          </label>
                          <button
                            onClick={runSuno}
                            disabled={sunoRunning}
                            className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-100"
                          >
                            {sunoRunning ? "Starting..." : "Generate with Suno"}
                          </button>
                          <button
                            onClick={pollSuno}
                            disabled={!sunoTaskId || sunoPolling}
                            className="rounded-full border border-white/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-100"
                          >
                            {sunoPolling ? "Checking..." : "Check status"}
                          </button>
                        </div>
                        {sunoError && <p className="text-[12px] text-rose-300">{sunoError}</p>}
                      </div>
                      <div className="space-y-2">
                        <div className="rounded border border-white/10 bg-slate-900/60 px-2 py-2">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tracks</p>
                          {sunoTracks.length === 0 && <p className="text-[12px] text-slate-500">No tracks yet. Generate and poll for results.</p>}
                          <div className="space-y-2">
                            {sunoTracks.map((track, idx) => (
                              <div key={`${track.id || idx}`} className="rounded border border-white/10 bg-slate-950/60 p-2 text-[12px]">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-white">{track.title || `Track ${idx + 1}`}</p>
                                  <span className="text-[11px] text-slate-400">{track.duration ? `${track.duration.toFixed(1)}s` : ""}</span>
                                </div>
                                <p className="text-[11px] text-slate-400">{track.tags}</p>
                                {track.image_url && <img src={track.image_url} alt={track.title || "cover"} className="mt-2 h-28 w-full rounded object-cover" />}
                                {track.audio_url && (
                                  <audio controls src={track.audio_url} className="mt-2 w-full">
                                    Your browser does not support audio playback.
                                  </audio>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Uses the Suno API (V4/V4.5/V5). Provide a callback URL in backend config to receive webhooks, or poll status here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {showTab("calendar") && (
                <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Calendar</p>
                      <span className="text-[11px] text-slate-500">{calendarItems.length || 0} items</span>
                    </div>
                    <div className="mt-2 overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                      <table className="min-w-full text-left text-[12px]">
                        <thead className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                          <tr>
                            <th className="px-2 py-2">Date</th>
                            <th className="px-2 py-2">Time</th>
                            <th className="px-2 py-2">Title</th>
                            <th className="px-2 py-2">Owner</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(calendarItems.length ? calendarItems : [{ key: "cal-empty", title: "No events yet", date: "TBD", time: "", owner: "" }]).map((entry) => (
                            <tr key={entry.key} className="border-t border-white/5">
                              <td className="px-2 py-2 text-slate-200">{entry.date || "TBD"}</td>
                              <td className="px-2 py-2 text-slate-300">{entry.time || "—"}</td>
                              <td className="px-2 py-2 text-white">{entry.title}</td>
                              <td className="px-2 py-2 text-slate-300">{entry.owner || "Unassigned"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Due this week</p>
                    <div className="mt-2 space-y-2">
                      {calendarItems.filter((item) => {
                        const date = item.date ? new Date(item.date).getTime() : null;
                        const now = Date.now();
                        return date && date <= now + 7 * 24 * 60 * 60 * 1000;
                      }).slice(0, 6).map((entry) => (
                        <div key={`week-${entry.key}`} className="rounded border border-white/10 bg-slate-900/60 px-3 py-2 text-[12px]">
                          <p className="font-semibold text-white">{entry.title}</p>
                          <p className="text-[11px] text-slate-400">{entry.date} {entry.time ? `@ ${entry.time}` : ""}</p>
                          <p className="text-[11px] text-slate-500">{entry.owner || "Unassigned"}</p>
                        </div>
                      ))}
                      {calendarItems.length === 0 && <p className="text-slate-500 text-[12px]">No upcoming items.</p>}
                    </div>
                  </div>
                </div>
              )}
              {showTab("data") && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Data capture</p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Project</p>
                        <input value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} placeholder="Name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <input value={newProjectClient} onChange={(event) => setNewProjectClient(event.target.value)} placeholder="Client" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <select value={newProjectOwner} onChange={(event) => setNewProjectOwner(event.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                          <option>Ava</option>
                          <option>Noah</option>
                          <option>Mia</option>
                        </select>
                        <button onClick={addProject} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">
                          Save project
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Task</p>
                        <input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="Title" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <input value={newTaskProject} onChange={(event) => setNewTaskProject(event.target.value)} placeholder="Project" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <input type="date" value={newTaskDue} onChange={(event) => setNewTaskDue(event.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <button onClick={addTask} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">
                          Save task
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Note</p>
                        <input value={newNoteTitle} onChange={(event) => setNewNoteTitle(event.target.value)} placeholder="Title" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <textarea value={newNoteContent} onChange={(event) => setNewNoteContent(event.target.value)} rows={2} placeholder="Content" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <input value={newNoteReference} onChange={(event) => setNewNoteReference(event.target.value)} placeholder="Reference (project/task)" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <button onClick={addNote} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">
                          Save note
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Agent</p>
                        <input value={newAgentName} onChange={(event) => setNewAgentName(event.target.value)} placeholder="Agent name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <input value={newAgentRole} onChange={(event) => setNewAgentRole(event.target.value)} placeholder="Role" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                        <button onClick={addAgent} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">
                          Save agent
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Data tables</p>
                    <div className="mt-2 grid gap-3 lg:grid-cols-2">
                      <div className="overflow-x-auto rounded-lg border border-white/10 bg-slate-900/60">
                        <table className="min-w-full text-left text-[12px]">
                          <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                            <tr>
                              <th className="px-2 py-2">Project</th>
                              <th className="px-2 py-2">Client</th>
                              <th className="px-2 py-2">Owner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projects.map((project) => (
                              <tr key={project.id} className="border-t border-white/5">
                                <td className="px-2 py-2">{project.name}</td>
                                <td className="px-2 py-2 text-slate-300">{project.client}</td>
                                <td className="px-2 py-2 text-slate-300">{project.owner}</td>
                              </tr>
                            ))}
                            {projects.length === 0 && (
                              <tr>
                                <td className="px-2 py-3 text-slate-500" colSpan={3}>
                                  No projects yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-white/10 bg-slate-900/60">
                        <table className="min-w-full text-left text-[12px]">
                          <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                            <tr>
                              <th className="px-2 py-2">Task</th>
                              <th className="px-2 py-2">Status</th>
                              <th className="px-2 py-2">Due</th>
                              <th className="px-2 py-2">Owner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tasks.map((task) => (
                              <tr key={task.id} className="border-t border-white/5">
                                <td className="px-2 py-2">{task.title}</td>
                                <td className="px-2 py-2 text-slate-300">{task.status}</td>
                                <td className="px-2 py-2 text-slate-300">{task.due || "TBD"}</td>
                                <td className="px-2 py-2 text-slate-300">{task.owner || "Claimable"}</td>
                              </tr>
                            ))}
                            {tasks.length === 0 && (
                              <tr>
                                <td className="px-2 py-3 text-slate-500" colSpan={4}>
                                  No tasks yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Project saves</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{projectSaves.length} saved</span>
                        <button
                          onClick={() => setProjectSaves([])}
                          className="text-[11px] text-emerald-200 underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      {Object.keys(projectSavesByProject).length ? (
                        Object.entries(projectSavesByProject).map(([project, entries]) => (
                          <div key={project} className="rounded border border-white/10 bg-slate-900/60 p-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[12px] font-semibold text-white">{project}</p>
                              <span className="text-[11px] text-slate-400">{entries.length} items</span>
                            </div>
                            <div className="mt-2 space-y-2">
                              {entries.map((entry) => (
                                <details key={entry.id} className="rounded border border-white/10 bg-slate-950/60 px-2 py-1 text-[12px] text-slate-100">
                                  <summary className="cursor-pointer text-[11px] text-slate-300">
                                    <span className="font-semibold text-white">{entry.section}</span> - {entry.title}{" "}
                                    <span className="text-slate-500">({new Date(entry.createdAt).toLocaleString()})</span>
                                  </summary>
                                  {entry.meta && (
                                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400">
                                      {Object.entries(entry.meta).map(([key, value]) => (
                                        <span key={key} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                          {key}: {value}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <pre className="mt-2 whitespace-pre-wrap rounded bg-black/40 p-2 text-[11px] text-slate-100">{entry.content}</pre>
                                </details>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500">No project saves yet.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {showTab("crm") && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Clients & Meetings</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add client</p>
                    <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <div className="flex gap-2">
                      <select value={newClientStatus} onChange={(e) => setNewClientStatus(e.target.value as Client["status"])} className="w-1/2 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                        <option>Lead</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>In progress</option><option>Lost</option><option>Closed</option>
                      </select>
                      <select value={newClientPriority} onChange={(e) => setNewClientPriority(e.target.value as Client["priority"])} className="w-1/2 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                        <option>Low</option><option>Medium</option><option>High</option>
                      </select>
                    </div>
                    <input value={newClientCompany} onChange={(e) => setNewClientCompany(e.target.value)} placeholder="Company" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="Email" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="Phone" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input type="date" value={newClientExpectedClose} onChange={(e) => setNewClientExpectedClose(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <button onClick={addClient} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save client</button>
                  </div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add meeting</p>
                    <input value={meetingName} onChange={(e) => setMeetingName(e.target.value)} placeholder="Meeting name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <select value={meetingClientId} onChange={(e) => setMeetingClientId(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option value="">Select client</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <select value={meetingType} onChange={(e) => setMeetingType(e.target.value as Meeting["type"])} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option>Online-Conference</option><option>Lunch</option><option>Meeting</option><option>Call</option>
                    </select>
                    <button onClick={addMeeting} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save meeting</button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Clients</p>
                      <span className="text-[11px] text-slate-500">{clients.length} total</span>
                    </div>
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {clients.length ? (
                        clients.map((client) => {
                          const isActive = client.id === activeClientId;
                          return (
                            <button
                              key={client.id}
                              onClick={() => {
                                setActiveClientId(client.id);
                                setActiveProjectId(null);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg border px-2 py-2 text-left text-sm transition ${
                                isActive ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-50" : "border-white/10 bg-white/5 text-white hover:border-white/30"
                              }`}
                            >
                              <div>
                                <p className="font-semibold">{client.name}</p>
                                <p className="text-[11px] text-slate-300">{client.company || "No company"}</p>
                              </div>
                              <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-slate-200">{client.status}</span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-[12px] text-slate-500">Add clients to see projects and tasks.</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Projects for {activeClient?.name || "client"}</p>
                      <span className="text-[11px] text-slate-500">{clientProjects.length} active</span>
                    </div>
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {clientProjects.length ? (
                        clientProjects.map((proj) => {
                          const isActive = proj.id === activeProjectId;
                          return (
                            <button
                              key={proj.id}
                              onClick={() => setActiveProjectId(proj.id)}
                              className={`flex w-full items-center justify-between rounded-lg border px-2 py-2 text-left text-sm transition ${
                                isActive ? "border-sky-400/70 bg-sky-500/10 text-sky-50" : "border-white/10 bg-white/5 text-white hover:border-white/30"
                              }`}
                            >
                              <div>
                                <p className="font-semibold">{proj.name}</p>
                                <p className="text-[11px] text-slate-300">{proj.owner || "Unassigned"}</p>
                              </div>
                              <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-slate-200">{proj.status}</span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-[12px] text-slate-500">No projects linked to this client.</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tasks for {activeProject?.name || "project"}</p>
                      <span className="text-[11px] text-slate-500">{projectTasks.length} open</span>
                    </div>
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {projectTasks.length ? (
                        projectTasks.map((task) => (
                          <div key={task.id} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm">
                            <p className="font-semibold text-white">{task.title}</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-300">
                              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">{task.status}</span>
                              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">{task.owner || "Unassigned"}</span>
                              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">{task.due || "No due"}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[12px] text-slate-500">No tasks for this project.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                  <table className="min-w-full text-left text-[12px]">
                    <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                      <tr>
                        <th className="px-2 py-2">Client</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2">Priority</th>
                        <th className="px-2 py-2">Expected Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((c) => (
                        <tr key={c.id} className="border-t border-white/5">
                          <td className="px-2 py-2">{c.name}</td>
                          <td className="px-2 py-2 text-slate-300">{c.status}</td>
                          <td className="px-2 py-2 text-slate-300">{c.priority}</td>
                          <td className="px-2 py-2 text-slate-300">{c.expectedClose || "TBD"}</td>
                        </tr>
                      ))}
                      {clients.length === 0 && (
                        <tr>
                          <td className="px-2 py-3 text-slate-500" colSpan={4}>No clients yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                  <table className="min-w-full text-left text-[12px]">
                    <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                      <tr>
                        <th className="px-2 py-2">Meeting</th>
                        <th className="px-2 py-2">Client</th>
                        <th className="px-2 py-2">Date</th>
                        <th className="px-2 py-2">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map((m) => (
                        <tr key={m.id} className="border-t border-white/5">
                          <td className="px-2 py-2">{m.name}</td>
                          <td className="px-2 py-2 text-slate-300">{clients.find((c) => c.id === m.clientId)?.name || "-"}</td>
                          <td className="px-2 py-2 text-slate-300">{m.date || "TBD"}</td>
                          <td className="px-2 py-2 text-slate-300">{m.type}</td>
                        </tr>
                      ))}
                      {meetings.length === 0 && (
                        <tr>
                          <td className="px-2 py-3 text-slate-500" colSpan={4}>No meetings yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {showTab("coder") && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">AI Coder (plan → approve → run → test)</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={generateCoderPlan} disabled={coderPlanRunning} className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-emerald-100 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-70">{coderPlanRunning ? "Planning..." : "Generate plan"}</button>
                    <button onClick={approveCoderPlan} disabled={!coderPlanSteps.length} className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${coderPlanApproved ? "border-emerald-400 text-emerald-100 bg-emerald-500/10" : "border-white/30 text-white bg-white/10"}`}>Approve plan</button>
                    <button onClick={runCoderSteps} disabled={!coderPlanApproved || !coderPlanSteps.length} className="rounded-full border border-sky-400/60 bg-sky-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-sky-50 transition hover:border-sky-300 disabled:cursor-not-allowed disabled:opacity-70">Run steps</button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
                  <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Goal</p>
                    <textarea value={coderGoal} onChange={(e) => setCoderGoal(e.target.value)} rows={3} className="w-full rounded border border-white/20 bg-slate-900/70 px-2 py-1 text-sm" placeholder="Describe the change the AI coder should implement." />
                    <div className="grid gap-2 lg:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-slate-950/60 p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Plan</p>
                          <button
                            onClick={() =>
                              saveProjectEntry(
                                "Coder plan",
                                buildSavePayload({
                                  goal: coderGoal,
                                  planText: coderPlanText,
                                  steps: coderStepList,
                                  stepOutputs: coderStepOutputs,
                                }),
                                formatSaveTitle(coderGoal, "Coder plan"),
                              )
                            }
                            className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                          >
                            Save
                          </button>
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto text-[12px]">
                          {coderStepList.length ? (
                            coderStepList.map((step) => {
                              const status = coderStepStatus[step.id] || "pending";
                              const color =
                                status === "running" ? "border-amber-400/60 bg-amber-500/10 text-amber-100" :
                                status === "done" ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100" :
                                status === "error" ? "border-rose-400/60 bg-rose-500/10 text-rose-100" :
                                "border-white/10 bg-white/5 text-white";
                              return (
                                <div key={step.id} className={`rounded border px-2 py-1 ${color}`}>
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold">{step.id}</p>
                                    <span className="text-[11px] uppercase tracking-[0.2em]">{status}</span>
                                  </div>
                                  <p className="text-[12px] font-semibold">{step.title}</p>
                                  <p className="text-[12px] text-slate-200">{step.detail}</p>
                                  {coderStepOutputs[step.id] && (
                                    <details className="mt-1">
                                      <summary className="cursor-pointer text-[11px] text-emerald-200 underline">Output</summary>
                                      <pre className="mt-1 whitespace-pre-wrap rounded bg-black/30 p-2 text-[11px] text-slate-100">{coderStepOutputs[step.id]}</pre>
                                    </details>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-slate-500">Generate a plan to see steps.</p>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-slate-950/60 p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Logs & tests</p>
                          <button
                            onClick={() =>
                              saveProjectEntry(
                                "Coder logs/tests",
                                buildSavePayload({
                                  goal: coderGoal,
                                  logs: coderExecLog,
                                  testStatus: coderTestStatus,
                                  testOutput: coderTestOutput,
                                }),
                                "Coder logs/tests",
                              )
                            }
                            className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                          >
                            Save
                          </button>
                        </div>
                        <div className="max-h-32 space-y-1 overflow-y-auto text-[12px]">
                          {coderExecLog.length ? coderExecLog.map((line, idx) => <p key={idx} className="text-slate-200">{line}</p>) : <p className="text-slate-500">Awaiting execution.</p>}
                        </div>
                        <div className="mt-2 rounded border border-white/10 bg-slate-900/70 p-2 text-[12px]">
                          <div className="flex items-center justify-between text-[11px] text-slate-300">
                            <span>Tests</span>
                            <span>{coderTestStatus}</span>
                          </div>
                          {coderTestOutput ? <pre className="mt-1 whitespace-pre-wrap text-slate-100">{coderTestOutput}</pre> : <p className="text-slate-500">Will run after steps.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Env vars for coder</p>
                      <div className="flex gap-2">
                        <input value={coderEnvKey} onChange={(e) => setCoderEnvKey(e.target.value)} placeholder="KEY" className="w-1/2 rounded border border-white/20 bg-slate-900/70 px-2 py-1 text-sm" />
                        <input value={coderEnvVal} onChange={(e) => setCoderEnvVal(e.target.value)} placeholder="value" className="w-1/2 rounded border border-white/20 bg-slate-900/70 px-2 py-1 text-sm" />
                      </div>
                      <button onClick={addCoderEnv} className="mt-2 w-full rounded border border-white/30 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-white/20">Set env</button>
                      <div className="mt-2 max-h-32 space-y-1 overflow-y-auto text-[12px]">
                        {Object.keys(coderEnv).length ? (
                          Object.entries(coderEnv).map(([k, v]) => (
                            <div key={k} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-200">
                              <span className="font-semibold">{k}</span> = <span className="text-slate-300">{v || "<empty>"}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500">No env vars set.</p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Raw plan JSON</p>
                      <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded bg-black/30 p-2 text-[11px] text-slate-100">{coderPlanText || "Generate a plan to populate this."}</pre>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {showTab("eng") && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">GitHub Projects & Sora Tabs</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add GitHub project</p>
                    <input value={ghName} onChange={(e) => setGhName(e.target.value)} placeholder="Project" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={ghRepoUrl} onChange={(e) => setGhRepoUrl(e.target.value)} placeholder="Repo URL" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={ghOwner} onChange={(e) => setGhOwner(e.target.value)} placeholder="Owner" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <div className="flex gap-2">
                      <select value={ghStatus} onChange={(e) => setGhStatus(e.target.value as GithubProject["status"])} className="w-1/2 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                        <option>Backlog</option><option>In Progress</option><option>Blocked</option><option>Done</option>
                      </select>
                      <input value={ghCategory} onChange={(e) => setGhCategory(e.target.value)} placeholder="Category" className="w-1/2 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    </div>
                    <button onClick={addGithubProject} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save GitHub project</button>
                  </div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add Sora prompt tab</p>
                    <input value={soraName} onChange={(e) => setSoraName(e.target.value)} placeholder="Name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={soraLink} onChange={(e) => setSoraLink(e.target.value)} placeholder="Link" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input type="number" value={soraOrder} onChange={(e) => setSoraOrder(Number(e.target.value))} placeholder="Order" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <button onClick={addSoraTab} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save tab</button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                    <table className="min-w-full text-left text-[12px]">
                      <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        <tr><th className="px-2 py-2">Project</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Owner</th></tr>
                      </thead>
                      <tbody>
                        {githubProjects.map((p) => (
                          <tr key={p.id} className="border-t border-white/5">
                            <td className="px-2 py-2">{p.project}</td>
                            <td className="px-2 py-2 text-slate-300">{p.status}</td>
                            <td className="px-2 py-2 text-slate-300">{p.owner}</td>
                          </tr>
                        ))}
                        {githubProjects.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>No GitHub projects yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                    <table className="min-w-full text-left text-[12px]">
                      <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        <tr><th className="px-2 py-2">Order</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Link</th></tr>
                      </thead>
                      <tbody>
                        {soraTabs.sort((a, b) => a.order - b.order).map((t) => (
                          <tr key={t.id} className="border-t border-white/5">
                            <td className="px-2 py-2">{t.order}</td>
                            <td className="px-2 py-2">{t.name}</td>
                            <td className="px-2 py-2 text-emerald-300">{t.link}</td>
                          </tr>
                        ))}
                        {soraTabs.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>No Sora tabs yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              )}

              {showTab("notes") && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Notes & Notebooks</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add note</p>
                    <input value={noteEntryName} onChange={(e) => setNoteEntryName(e.target.value)} placeholder="Note title" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <select value={noteEntryStatus} onChange={(e) => setNoteEntryStatus(e.target.value as NoteEntry["status"])} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option>Inbox</option><option>To Review</option><option>Final</option>
                    </select>
                    <select value={noteEntryNotebookId} onChange={(e) => setNoteEntryNotebookId(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option value="">Notebook (optional)</option>
                      {notebooks.map((nb) => <option key={nb.id} value={nb.id}>{nb.name}</option>)}
                    </select>
                    <div className="flex items-center gap-3 text-[12px] text-slate-300">
                      <label className="flex items-center gap-1"><input type="checkbox" checked={noteEntryFavorite} onChange={(e) => setNoteEntryFavorite(e.target.checked)} /> Favorite</label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={noteEntryPin} onChange={(e) => setNoteEntryPin(e.target.checked)} /> Pin</label>
                    </div>
                    <button onClick={addNoteEntry} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save note</button>
                  </div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add notebook</p>
                    <input value={notebookName} onChange={(e) => setNotebookName(e.target.value)} placeholder="Notebook name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <label className="flex items-center gap-2 text-[12px] text-slate-300">
                      <input type="checkbox" checked={notebookArchive} onChange={(e) => setNotebookArchive(e.target.checked)} /> Archive
                    </label>
                    <button onClick={addNotebook} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save notebook</button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                    <table className="min-w-full text-left text-[12px]">
                      <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        <tr><th className="px-2 py-2">Note</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Notebook</th></tr>
                      </thead>
                      <tbody>
                        {noteEntries.map((n) => (
                          <tr key={n.id} className="border-t border-white/5">
                            <td className="px-2 py-2">{n.name}</td>
                            <td className="px-2 py-2 text-slate-300">{n.status}</td>
                            <td className="px-2 py-2 text-slate-300">{notebooks.find((nb) => nb.id === n.notebookId)?.name || "-"}</td>
                          </tr>
                        ))}
                        {noteEntries.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>No notes yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                    <table className="min-w-full text-left text-[12px]">
                      <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        <tr><th className="px-2 py-2">Notebook</th><th className="px-2 py-2">Archive</th><th className="px-2 py-2">Edited</th></tr>
                      </thead>
                      <tbody>
                        {notebooks.map((nb) => (
                          <tr key={nb.id} className="border-t border-white/5">
                            <td className="px-2 py-2">{nb.name}</td>
                            <td className="px-2 py-2 text-slate-300">{nb.archive ? "Yes" : "No"}</td>
                            <td className="px-2 py-2 text-slate-300">{new Date(nb.edited).toLocaleString()}</td>
                          </tr>
                        ))}
                        {notebooks.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>No notebooks yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              )}

              {showTab("finance") && (
              <>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Payroll & Fundraising</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add payroll run</p>
                    <input value={payrollName} onChange={(e) => setPayrollName(e.target.value)} placeholder="Run name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <div className="flex gap-2">
                      <input type="date" value={payrollStart} onChange={(e) => setPayrollStart(e.target.value)} className="w-1/2 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                      <input type="date" value={payrollEnd} onChange={(e) => setPayrollEnd(e.target.value)} className="w-1/2 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    </div>
                    <select value={payrollType} onChange={(e) => setPayrollType(e.target.value as PayrollRun["type"])} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option>Project Based</option><option>Hourly</option><option>Fixed</option>
                    </select>
                    <input type="number" value={payrollRate} onChange={(e) => setPayrollRate(Number(e.target.value))} placeholder="Rate" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input type="number" value={payrollWeeklyHours} onChange={(e) => setPayrollWeeklyHours(Number(e.target.value))} placeholder="Weekly hours" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input type="number" value={payrollTasks} onChange={(e) => setPayrollTasks(Number(e.target.value))} placeholder="Tasks completed" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" value={payrollBonuses} onChange={(e) => setPayrollBonuses(Number(e.target.value))} placeholder="Bonuses" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                      <input type="number" value={payrollDeductions} onChange={(e) => setPayrollDeductions(Number(e.target.value))} placeholder="Deductions" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                      <input type="number" value={payrollOverrideAmount} onChange={(e) => setPayrollOverrideAmount(Number(e.target.value))} placeholder="Override" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    </div>
                    <input value={payrollBankName} onChange={(e) => setPayrollBankName(e.target.value)} placeholder="Bank name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={payrollAccountNumber} onChange={(e) => setPayrollAccountNumber(e.target.value)} placeholder="Account number" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={payrollCountry} onChange={(e) => setPayrollCountry(e.target.value)} placeholder="Country" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={payrollCity} onChange={(e) => setPayrollCity(e.target.value)} placeholder="City" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={payrollAddress} onChange={(e) => setPayrollAddress(e.target.value)} placeholder="Full address" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={payrollPostalCode} onChange={(e) => setPayrollPostalCode(e.target.value)} placeholder="Postal code" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <p className="text-[11px] text-slate-400">Est. Total: {calculatePayrollTotal().toFixed(2)}</p>
                    <button onClick={addPayrollRun} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save payroll run</button>
                  </div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add fundraising</p>
                    <input value={fundName} onChange={(e) => setFundName(e.target.value)} placeholder="Name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <select value={fundStatus} onChange={(e) => setFundStatus(e.target.value as FundraisingEntry["status"])} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option>Contacted</option><option>Pitched</option><option>Diligence</option><option>Won</option><option>Lost</option>
                    </select>
                    <input type="number" value={fundAvgCheck} onChange={(e) => setFundAvgCheck(Number(e.target.value))} placeholder="Avg check size" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input type="number" value={fundCapital} onChange={(e) => setFundCapital(Number(e.target.value))} placeholder="Capital committed" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={fundPartnerName} onChange={(e) => setFundPartnerName(e.target.value)} placeholder="Partner name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={fundPartnerEmail} onChange={(e) => setFundPartnerEmail(e.target.value)} placeholder="Partner email" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={fundWarmName} onChange={(e) => setFundWarmName(e.target.value)} placeholder="Warm contact name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={fundWarmEmail} onChange={(e) => setFundWarmEmail(e.target.value)} placeholder="Warm contact email" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <textarea value={fundDescription} onChange={(e) => setFundDescription(e.target.value)} rows={2} placeholder="Description" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <textarea value={fundLostReason} onChange={(e) => setFundLostReason(e.target.value)} rows={2} placeholder="Lost reason" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <button onClick={addFundraisingEntry} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save fundraising</button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                    <table className="min-w-full text-left text-[12px]">
                      <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        <tr><th className="px-2 py-2">Run</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Est Total</th></tr>
                      </thead>
                      <tbody>
                        {payrollRuns.map((p) => (
                          <tr key={p.id} className="border-t border-white/5">
                            <td className="px-2 py-2">{p.runName}</td>
                            <td className="px-2 py-2 text-slate-300">{p.type}</td>
                            <td className="px-2 py-2 text-slate-300">
                              {((p.type === "Project Based" ? p.tasksCompleted * p.rate : p.type === "Hourly" ? p.weeklyHours * p.rate : p.rate) + p.bonuses - p.deductions + p.overrideAmount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        {payrollRuns.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>No payroll runs yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                    <table className="min-w-full text-left text-[12px]">
                      <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        <tr><th className="px-2 py-2">Name</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Avg Check</th><th className="px-2 py-2">Capital</th></tr>
                      </thead>
                      <tbody>
                        {fundraisingEntries.map((f) => (
                          <tr key={f.id} className="border-t border-white/5">
                            <td className="px-2 py-2">{f.name}</td>
                            <td className="px-2 py-2 text-slate-300">{f.status}</td>
                            <td className="px-2 py-2 text-slate-300">{f.avgCheckSize}</td>
                            <td className="px-2 py-2 text-slate-300">{f.capitalCommitted}</td>
                          </tr>
                        ))}
                        {fundraisingEntries.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={4}>No fundraising yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Expense Categories & Platform Costs</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add category</p>
                    <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <button onClick={addCategory} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save category</button>
                    <div className="mt-2 overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                      <table className="min-w-full text-left text-[12px]">
                        <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                          <tr><th className="px-2 py-2">Name</th><th className="px-2 py-2">This Month</th><th className="px-2 py-2">Total</th></tr>
                        </thead>
                        <tbody>
                          {categories.map((c) => (
                            <tr key={c.id} className="border-t border-white/5">
                              <td className="px-2 py-2">{c.name}</td>
                              <td className="px-2 py-2 text-slate-300">{c.spentMonth}</td>
                              <td className="px-2 py-2 text-slate-300">{c.spentTotal}</td>
                            </tr>
                          ))}
                          {categories.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>No categories yet.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Add platform cost</p>
                    <input value={platformTool} onChange={(e) => setPlatformTool(e.target.value)} placeholder="Tool" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <select value={platformVendor} onChange={(e) => setPlatformVendor(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option>OpenAI</option><option>Anthropic</option><option>xAI</option><option>Groq</option><option>Poe</option><option>Hailuo</option><option>Other</option>
                    </select>
                    <input value={platformUsedFor} onChange={(e) => setPlatformUsedFor(e.target.value)} placeholder="Used for (comma separated)" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={platformCostModel} onChange={(e) => setPlatformCostModel(e.target.value)} placeholder="Cost model (comma separated)" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <select value={platformBillingUnit} onChange={(e) => setPlatformBillingUnit(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option>Month</option><option>Year</option><option>Credits</option><option>Tokens</option><option>Images</option><option>Minutes</option><option>Requests</option><option>GB</option><option>Other</option>
                    </select>
                    <input type="number" value={platformSubscription} onChange={(e) => setPlatformSubscription(Number(e.target.value))} placeholder="Subscription price" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input type="number" value={platformCredits} onChange={(e) => setPlatformCredits(Number(e.target.value))} placeholder="Credits pack price" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={platformUsagePrice} onChange={(e) => setPlatformUsagePrice(e.target.value)} placeholder="Usage price" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input type="date" value={platformRenewal} onChange={(e) => setPlatformRenewal(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <label className="flex items-center gap-2 text-[12px] text-slate-300">
                      <input type="checkbox" checked={platformActive} onChange={(e) => setPlatformActive(e.target.checked)} /> Active
                    </label>
                    <input value={platformAdminUrl} onChange={(e) => setPlatformAdminUrl(e.target.value)} placeholder="Access/Admin URL" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <textarea value={platformNotes} onChange={(e) => setPlatformNotes(e.target.value)} rows={2} placeholder="Notes" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <button onClick={addPlatformCost} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Save platform</button>
                  </div>
                </div>
                <div className="mt-3 overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                  <table className="min-w-full text-left text-[12px]">
                    <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                      <tr><th className="px-2 py-2">Tool</th><th className="px-2 py-2">Vendor</th><th className="px-2 py-2">Cost model</th><th className="px-2 py-2">Renewal</th><th className="px-2 py-2">Active</th></tr>
                    </thead>
                    <tbody>
                      {platformCosts.map((p) => (
                        <tr key={p.id} className="border-t border-white/5">
                          <td className="px-2 py-2">{p.tool}</td>
                          <td className="px-2 py-2 text-slate-300">{p.vendor}</td>
                          <td className="px-2 py-2 text-slate-300">{p.costModel.join(", ")}</td>
                          <td className="px-2 py-2 text-slate-300">{p.renewalDate || "TBD"}</td>
                          <td className="px-2 py-2 text-slate-300">{p.active ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                      {platformCosts.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={5}>No platform costs yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
              )}

              {showTab("storyboard") && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Music Video Storyboard</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Audio & clip intake</p>
                    <input value={storyAudioUrl} onChange={(e) => setStoryAudioUrl(e.target.value)} placeholder="Audio URL (mp3/wav)" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (audioObjectUrlRef.current) {
                          URL.revokeObjectURL(audioObjectUrlRef.current);
                        }
                        const nextUrl = URL.createObjectURL(file);
                        audioObjectUrlRef.current = nextUrl;
                        setStoryAudioUrl(nextUrl);
                      }}
                      className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                    />
                    <p className="text-[11px] text-slate-400">Upload mp3/wav (kept local in-browser) or paste a remote URL.</p>
                    <audio
                      controls
                      src={storyAudioUrl || undefined}
                      className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs"
                    />
                    <input value={storyClipName} onChange={(e) => setStoryClipName(e.target.value)} placeholder="Clip name" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input value={storyClipUrl} onChange={(e) => setStoryClipUrl(e.target.value)} placeholder="Clip URL (mp4/webm)" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const nextUrl = URL.createObjectURL(file);
                        videoObjectUrlsRef.current.push(nextUrl);
                        setStoryClipUrl(nextUrl);
                        if (!storyClipName.trim()) {
                          setStoryClipName(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }}
                      className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                    />
                    <p className="text-[11px] text-slate-400">Upload mp4/webm (kept local in-browser) or paste a remote URL.</p>
                    <div className="flex gap-2">
                      <input type="number" value={storyClipStart} onChange={(e) => setStoryClipStart(Number(e.target.value))} placeholder="Start (s)" className="w-1/2 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                      <input type="number" value={storyClipEnd} onChange={(e) => setStoryClipEnd(Number(e.target.value))} placeholder="End (s)" className="w-1/2 rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    </div>
                    <button onClick={addStoryClip} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Add clip</button>
                  </div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Transitions</p>
                    <select value={transitionFrom} onChange={(e) => setTransitionFrom(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option value="">From clip</option>
                      {storyClips.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={transitionTo} onChange={(e) => setTransitionTo(e.target.value)} className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm">
                      <option value="">To clip</option>
                      {storyClips.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Preset</p>
                    <select
                      value={transitionPresetKey}
                      onChange={(e) => {
                        const key = e.target.value;
                        setTransitionPresetKey(key);
                        const preset = transitionPresets.find((p) => p.type === key);
                        if (preset) {
                          setTransitionType(preset.type);
                          setTransitionDuration(preset.duration);
                        }
                      }}
                      className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                    >
                      {transitionPresets.map((p) => (
                        <option key={p.type} value={p.type}>{p.label}</option>
                      ))}
                    </select>
                    <input value={transitionType} onChange={(e) => setTransitionType(e.target.value)} placeholder="Type (Crossfade, Cut, Dip...)" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <input type="number" value={transitionDuration} onChange={(e) => setTransitionDuration(Number(e.target.value))} placeholder="Duration (s)" className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm" />
                    <button onClick={addStoryTransition} className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20">Add transition</button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
                  <div className="overflow-x-auto rounded border border-white/10 bg-slate-900/60">
                    <table className="min-w-full text-left text-[12px]">
                      <thead className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        <tr><th className="px-2 py-2">Clip</th><th className="px-2 py-2">Range (s)</th><th className="px-2 py-2">Solo</th><th className="px-2 py-2">Preview</th></tr>
                      </thead>
                      <tbody>
                        {storyClips.map((c) => (
                          <tr key={c.id} className="border-t border-white/5">
                            <td className="px-2 py-2">{c.name}</td>
                            <td className="px-2 py-2 text-slate-300">{c.start} - {c.end || "end"}</td>
                            <td className="px-2 py-2 text-slate-300">
                              <label className="flex items-center gap-1 text-xs">
                                <input type="checkbox" checked={c.solo} onChange={() => toggleClipSolo(c.id)} /> Solo
                              </label>
                            </td>
                            <td className="px-2 py-2">
                              <button onClick={() => setPreviewClipUrl(c.mediaUrl)} className="rounded border border-white/30 px-2 py-1 text-[11px] text-white hover:border-white/60">Play</button>
                            </td>
                          </tr>
                        ))}
                        {storyClips.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={4}>No clips yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Preview</p>
                    {previewClipUrl ? (
                      <video src={previewClipUrl} controls className="w-full rounded-lg border border-white/10 bg-black/30" />
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-900/40 text-[12px] text-slate-500">
                        Select a clip to preview
                      </div>
                    )}
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Transitions</p>
                    <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-white/10 bg-slate-900/60 p-2 text-[12px]">
                      {storyTransitions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded border border-white/10 bg-slate-950/60 px-2 py-1">
                          <span>{storyClips.find((c) => c.id === t.fromId)?.name || "?"} → {storyClips.find((c) => c.id === t.toId)?.name || "?"}</span>
                          <span className="text-slate-400">{t.type} · {t.duration}s</span>
                        </div>
                      ))}
                      {storyTransitions.length === 0 && <p className="text-slate-500">No transitions yet.</p>}
                    </div>
                    <button onClick={exportStoryboardManifest} className="w-full rounded border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300">
                      Export storyboard manifest
                    </button>
                    <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Maverick vision edit</p>
                        <button
                          onClick={() =>
                            saveProjectEntry(
                              "Maverick output",
                              buildSavePayload({ prompt: maverickPrompt, output: maverickOutput, clips: storyClips }),
                              formatSaveTitle(maverickPrompt, "Maverick output"),
                            )
                          }
                          className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                        >
                          Save
                        </button>
                      </div>
                      <textarea
                        value={maverickPrompt}
                        onChange={(e) => setMaverickPrompt(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                        placeholder="Describe precise trims, solos, or rearranges for the clips."
                      />
                      <button
                        onClick={runMaverickClipEdits}
                        disabled={maverickRunning}
                        className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
                      >
                        {maverickRunning ? "Applying..." : "Apply Maverick edit"}
                      </button>
                      <div className={`max-h-40 overflow-y-auto rounded border border-white/10 bg-slate-950/60 p-2 text-[12px] ${maverickGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                        {maverickOutput ? maverickOutput.split("\n").map((line, idx) => <p key={idx}>{line}</p>) : <p className="text-slate-500">Output appears here.</p>}
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Polish & compile storyboard</p>
                        <button
                          onClick={() =>
                            saveProjectEntry(
                              "Storyboard compile",
                              buildSavePayload({ output: compileOutput, url: compileUrl, clips: storyClips }),
                              "Storyboard compile",
                            )
                          }
                          className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                        >
                          Save
                        </button>
                      </div>
                      <p className="text-[12px] text-slate-400">Trims, concatenates clips with ffmpeg, and produces a downloadable MP4.</p>
                      <button
                        onClick={compileStoryboard}
                        disabled={compileRunning}
                        className="w-full rounded border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300"
                      >
                        {compileRunning ? "Compiling..." : "Compile video"}
                      </button>
                      <div className={`space-y-1 rounded border border-white/10 bg-slate-950/60 p-2 text-[12px] ${compileGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                        {compileOutput && <p className="text-slate-200">{compileOutput}</p>}
                        {compileUrl ? (
                          <a href={compileUrl} download="storyboard-compiled.mp4" className="text-emerald-300 underline">
                            Download compiled video
                          </a>
                        ) : (
                          <p className="text-slate-500">Requires ffmpeg and write access on the server.</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Book writing agent</p>
                        <button
                          onClick={() =>
                            saveProjectEntry(
                              "Book output",
                              buildSavePayload({ prompt: bookPrompt, output: bookOutput }),
                              formatSaveTitle(bookPrompt, "Book output"),
                            )
                          }
                          className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                        >
                          Save
                        </button>
                      </div>
                      <textarea
                        value={bookPrompt}
                        onChange={(e) => setBookPrompt(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                        placeholder="Describe the book, chapters, style, POV, pacing..."
                      />
                      <button
                        onClick={runBookAgent}
                        disabled={bookRunning}
                        className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
                      >
                        {bookRunning ? "Generating..." : "Generate book outline"}
                      </button>
                      <div className={`max-h-40 overflow-y-auto rounded border border-white/10 bg-slate-950/60 p-2 text-[12px] ${bookGlow ? "animate-pulse ring-1 ring-emerald-400/60" : ""}`}>
                        {bookOutput ? bookOutput.split("\n").map((line, idx) => <p key={idx}>{line}</p>) : <p className="text-slate-500">Outline appears here.</p>}
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Storyboard Agent (Groq)</p>
                        <button
                          onClick={() =>
                            saveProjectEntry(
                              "Storyboard output",
                              buildSavePayload({
                                prompt: storyboardPrompt,
                                shots: storyboardShots,
                                notes: storyboardNotes,
                                output: storyboardOutput,
                              }),
                              formatSaveTitle(storyboardPrompt, "Storyboard output"),
                            )
                          }
                          className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 underline"
                        >
                          Save
                        </button>
                      </div>
                      <textarea
                        value={storyboardPrompt}
                        onChange={(e) => setStoryboardPrompt(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
                        placeholder="Describe the music video and let the agent generate a shot list + transitions."
                      />
                      <button
                        onClick={runStoryboardAgent}
                        disabled={storyboardRunning}
                        className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
                      >
                        {storyboardRunning ? "Generating..." : "Generate storyboard"}
                      </button>
                      <div className="space-y-2 rounded border border-white/10 bg-slate-950/60 p-2 text-[12px]">
                        {storyboardRunning && <p className="text-emerald-200">Thinking through shots...</p>}
                        {storyboardShots.length ? (
                          <div className="max-h-56 space-y-2 overflow-y-auto">
                            {storyboardShots.map((shot, idx) => (
                              <div key={shot.id || idx} className="rounded border border-emerald-400/30 bg-emerald-500/5 p-2 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-emerald-100">{shot.id}: {shot.name}</p>
                                  <span className="rounded-full border border-emerald-400/50 bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-100">{shot.duration}</span>
                                </div>
                                <p className="text-slate-100">{shot.beat}</p>
                                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-300">
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">Camera: {shot.camera}</span>
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">Transition: {shot.transition}</span>
                                  {shot.mood && <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">Mood: {shot.mood}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500">{storyboardOutput || "Agent output will appear here."}</p>
                        )}
                        {storyboardNotes && (
                          <div className="rounded border border-emerald-400/40 bg-emerald-500/10 p-2 text-emerald-100">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200">Notes</p>
                            <p className="text-[12px]">{storyboardNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
          </section>
        </div>
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          {assistantDockOpen ? (
            <div className="w-80 max-w-[90vw] rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-3 shadow-2xl backdrop-blur">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200">Assistant agent</p>
                  <p className="text-[12px] text-slate-300">Always-on operator for anything in this workspace.</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearAssistantDock}
                    className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200 hover:border-white/40"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      const last = latestAssistantFromHistory(assistantDockHistory, "");
                      saveProjectEntry(
                        "Assistant dock",
                        buildSavePayload({ last, history: assistantDockHistory }),
                        "Assistant dock",
                      );
                    }}
                    className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200 hover:border-white/40"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setAssistantDockOpen(false)}
                    className="rounded-full border border-white/30 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200 hover:border-white/60"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="mb-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-slate-900/80 p-2 text-[12px]">
                {assistantDockHistory.length ? (
                  assistantDockHistory.map((turn, idx) => (
                    <div
                      key={`${turn.role}-${idx}`}
                      className={`rounded border px-2 py-1 leading-snug ${
                        turn.role === "assistant"
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                          : "border-white/10 bg-white/5 text-white"
                      }`}
                    >
                      <p className="mb-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                        {turn.role === "assistant" ? "Agent" : "You"}
                      </p>
                      <p className="whitespace-pre-wrap">{turn.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">Ask anything; the agent can route and execute tasks for you.</p>
                )}
              </div>
              <div className="space-y-2">
                <textarea
                  value={assistantDockPrompt}
                  onChange={(e) => setAssistantDockPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void runAssistantDock();
                    }
                  }}
                  rows={3}
                  className="w-full rounded border border-white/20 bg-slate-900/80 px-2 py-1 text-sm"
                  placeholder="Type a command or request. Shift+Enter for newline."
                />
                <button
                  onClick={runAssistantDock}
                  disabled={assistantDockRunning}
                  className="w-full rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {assistantDockRunning ? "Working..." : "Run assistant"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAssistantDockOpen(true)}
              className="rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100 shadow-lg backdrop-blur transition hover:border-emerald-300"
            >
              Launch assistant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
