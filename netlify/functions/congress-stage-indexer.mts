import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

type Pagination = { count?: number };
type Bill = { number?: string | number; type?: string; introducedDate?: string };
type BillResponse = { bills?: Bill[]; pagination?: Pagination };
type SourceSystem = { code?: string | number; name?: string };
type Action = {
  actionDate?: string;
  text?: string;
  type?: string;
  sourceSystem?: SourceSystem;
};
type ActionResponse = { actions?: Action[]; pagination?: Pagination };

type StageCount = { congressTotal: number; sessionTotal: number };
type StageCounts = {
  committeeAction: StageCount;
  passedHouse: StageCount;
  passedSenate: StageCount;
  passedEither: StageCount;
  bothChambers: StageCount;
  presented: StageCount;
};

type WorkingState = {
  version: 1;
  congress: number;
  session: number;
  startedAt: string;
  updatedAt: string;
  typeIndex: number;
  offset: number;
  processed: number;
  totalExpected: number;
  typeTotals: number[];
  counts: StageCounts;
};

const API_ROOT = "https://api.congress.gov/v3";
const CONGRESS = "119";
const SESSION = 2;
const SESSION_START = "2026-01-03";
const BILL_TYPES = ["hr", "s", "hjres", "sjres", "hconres", "sconres", "hres", "sres"];
const BATCH_SIZE = 60;
const CONCURRENCY = 12;
const STORE_NAME = "congress-stage-index";
const WORKING_KEY = "119-working";
const PUBLISHED_KEY = "119-published";

function emptyCount(): StageCount {
  return { congressTotal: 0, sessionTotal: 0 };
}
function emptyCounts(): StageCounts {
  return {
    committeeAction: emptyCount(),
    passedHouse: emptyCount(),
    passedSenate: emptyCount(),
    passedEither: emptyCount(),
    bothChambers: emptyCount(),
    presented: emptyCount(),
  };
}

async function congressJson<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = Netlify.env.get("CONGRESS_API_KEY");
  if (!apiKey) throw new Error("Congress API key is not configured");
  const url = new URL(`${API_ROOT}${path}`);
  url.searchParams.set("format", "json");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Congress.gov returned ${response.status} for ${url.pathname}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function getTypeTotals(): Promise<number[]> {
  return Promise.all(BILL_TYPES.map(async (type) => {
    const data = await congressJson<BillResponse>(`/bill/${CONGRESS}/${type}`, {
      limit: "1", offset: "0", sort: "introducedDate+asc",
    });
    return Number(data.pagination?.count ?? data.bills?.length ?? 0);
  }));
}

async function loadActions(type: string, number: string): Promise<Action[]> {
  const all: Action[] = [];
  let offset = 0;
  while (true) {
    const data = await congressJson<ActionResponse>(`/bill/${CONGRESS}/${type}/${number}/actions`, {
      limit: "250", offset: String(offset),
    });
    const actions = data.actions ?? [];
    all.push(...actions);
    if (!actions.length || actions.length < 250) break;
    offset += actions.length;
    if (offset >= Number(data.pagination?.count ?? offset)) break;
  }
  return all;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isSessionDate(date: string): boolean {
  return Boolean(date) && date.slice(0, 10) >= SESSION_START;
}

function isHouseOrigin(type: string): boolean {
  return ["hr", "hjres", "hconres", "hres"].includes(type);
}

function isSingleChamberResolution(type: string): boolean {
  return type === "hres" || type === "sres";
}

function chamberForAction(action: Action): "House" | "Senate" | "" {
  const code = normalize(action.sourceSystem?.code);
  const name = normalize(action.sourceSystem?.name);
  if (code === "0" || name.includes("senate")) return "Senate";
  if (code === "1" || code === "2" || name.includes("house")) return "House";
  const text = normalize(action.text);
  if (text.includes(" house ") || text.startsWith("house ")) return "House";
  if (text.includes(" senate ") || text.startsWith("senate ")) return "Senate";
  return "";
}

function hasAnyDate(dates: string[]): boolean {
  return dates.some(Boolean);
}

function countStage(target: StageCount, dates: string[]) {
  if (!hasAnyDate(dates)) return;
  target.congressTotal += 1;
  if (dates.some(isSessionDate)) target.sessionTotal += 1;
}

function classifyMeasure(type: string, actions: Action[]) {
  const committeeDates: string[] = [];
  const passedHouseDates: string[] = [];
  const passedSenateDates: string[] = [];
  const presentedDates: string[] = [];
  const becameLawDates: string[] = [];
  const finalAgreementDates: string[] = [];
  const houseConferenceDates: string[] = [];
  const senateConferenceDates: string[] = [];

  for (const action of actions) {
    const date = String(action.actionDate ?? "").slice(0, 10);
    const text = normalize(action.text);
    const actionType = normalize(action.type);
    const chamber = chamberForAction(action);

    if (
      actionType === "committee" ||
      (actionType === "introreferral" && /(referred|committee|subcommittee)/.test(text))
    ) {
      committeeDates.push(date);
    }

    const passedHouse = /\bpassed house\b|\bagreed to in house\b|\bhouse agreed to\b|\bresolution agreed to in house\b/.test(text);
    const passedSenate = /\bpassed senate\b|\bagreed to in senate\b|\bsenate agreed to\b|\bresolution agreed to in senate\b/.test(text);
    if (passedHouse) passedHouseDates.push(date);
    if (passedSenate) passedSenateDates.push(date);

    if (actionType === "president" && /presented to president/.test(text)) presentedDates.push(date);
    if (actionType === "becamelaw" || /became (public|private) law/.test(text)) becameLawDates.push(date);

    if (
      /house agreed to senate amendment|house agreed to senate amendments|senate agreed to house amendment|senate agreed to house amendments|cleared for white house/.test(text)
    ) {
      finalAgreementDates.push(date);
    }

    if (actionType === "resolvingdifferences" && /conference report/.test(text) && /agreed to|adopted/.test(text)) {
      if (chamber === "House") houseConferenceDates.push(date);
      if (chamber === "Senate") senateConferenceDates.push(date);
    }
  }

  if (houseConferenceDates.length && senateConferenceDates.length) {
    finalAgreementDates.push([...houseConferenceDates, ...senateConferenceDates].sort().at(-1) ?? "");
  }

  if (!isSingleChamberResolution(type)) {
    const originHouse = isHouseOrigin(type);
    const secondChamberPassages = originHouse
      ? actions.filter((a) => /\bpassed senate\b|\bagreed to in senate\b|\bsenate agreed to\b|\bresolution agreed to in senate\b/.test(normalize(a.text)))
      : actions.filter((a) => /\bpassed house\b|\bagreed to in house\b|\bhouse agreed to\b|\bresolution agreed to in house\b/.test(normalize(a.text)));
    for (const action of secondChamberPassages) {
      const text = normalize(action.text);
      if (/without amendment|without objection/.test(text)) {
        finalAgreementDates.push(String(action.actionDate ?? "").slice(0, 10));
      }
    }
    finalAgreementDates.push(...presentedDates, ...becameLawDates);
  }

  return {
    committeeDates,
    passedHouseDates,
    passedSenateDates,
    passedEitherDates: [...passedHouseDates, ...passedSenateDates],
    bothChambersDates: finalAgreementDates,
    presentedDates,
  };
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function runner() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runner()));
  return results;
}

async function newWorkingState(): Promise<WorkingState> {
  const typeTotals = await getTypeTotals();
  const now = new Date().toISOString();
  return {
    version: 1,
    congress: 119,
    session: SESSION,
    startedAt: now,
    updatedAt: now,
    typeIndex: 0,
    offset: 0,
    processed: 0,
    totalExpected: typeTotals.reduce((sum, count) => sum + count, 0),
    typeTotals,
    counts: emptyCounts(),
  };
}

export default async (_req: Request, _context: Context) => {
  const store = getStore(STORE_NAME);
  try {
    let state = await store.get(WORKING_KEY, { type: "json" }) as WorkingState | null;
    if (!state || state.version !== 1 || state.typeIndex >= BILL_TYPES.length) {
      state = await newWorkingState();
    }

    const type = BILL_TYPES[state.typeIndex];
    const typeTotal = state.typeTotals[state.typeIndex] ?? 0;

    if (state.offset >= typeTotal) {
      state.typeIndex += 1;
      state.offset = 0;
    }

    if (state.typeIndex >= BILL_TYPES.length) {
      const completedAt = new Date().toISOString();
      await store.setJSON(PUBLISHED_KEY, {
        version: 1,
        congress: 119,
        session: SESSION,
        completedAt,
        processed: state.processed,
        totalExpected: state.totalExpected,
        counts: state.counts,
        definitions: {
          committeeAction: "Unique measures with at least one official Committee action or committee referral action.",
          passedHouse: "Unique measures with an official House passage/agreement action.",
          passedSenate: "Unique measures with an official Senate passage/agreement action.",
          passedEither: "Unique measures that passed or were agreed to by at least one chamber.",
          bothChambers: "Unique measures with a verified same-text agreement signal, including passage without amendment, final resolving-differences agreement, presentation, or enactment.",
          presented: "Unique measures with an official Presented to President action.",
        },
      });
      await store.delete(WORKING_KEY);
      return new Response(null, { status: 204 });
    }

    const activeType = BILL_TYPES[state.typeIndex];
    const data = await congressJson<BillResponse>(`/bill/${CONGRESS}/${activeType}`, {
      limit: String(BATCH_SIZE),
      offset: String(state.offset),
      sort: "introducedDate+asc",
    });
    const bills = data.bills ?? [];

    const classified = await mapWithConcurrency(bills, CONCURRENCY, async (bill) => {
      const number = String(bill.number ?? "");
      if (!number) return null;
      const actions = await loadActions(activeType, number);
      return classifyMeasure(activeType, actions);
    });

    for (const item of classified) {
      if (!item) continue;
      countStage(state.counts.committeeAction, item.committeeDates);
      countStage(state.counts.passedHouse, item.passedHouseDates);
      countStage(state.counts.passedSenate, item.passedSenateDates);
      countStage(state.counts.passedEither, item.passedEitherDates);
      countStage(state.counts.bothChambers, item.bothChambersDates);
      countStage(state.counts.presented, item.presentedDates);
    }

    state.processed += bills.length;
    state.offset += bills.length;
    state.updatedAt = new Date().toISOString();

    const activeTotal = state.typeTotals[state.typeIndex] ?? 0;
    if (!bills.length || state.offset >= activeTotal) {
      state.typeIndex += 1;
      state.offset = 0;
    }

    if (state.typeIndex >= BILL_TYPES.length) {
      const completedAt = new Date().toISOString();
      await store.setJSON(PUBLISHED_KEY, {
        version: 1,
        congress: 119,
        session: SESSION,
        completedAt,
        processed: state.processed,
        totalExpected: state.totalExpected,
        counts: state.counts,
        definitions: {
          committeeAction: "Unique measures with at least one official Committee action or committee referral action.",
          passedHouse: "Unique measures with an official House passage/agreement action.",
          passedSenate: "Unique measures with an official Senate passage/agreement action.",
          passedEither: "Unique measures that passed or were agreed to by at least one chamber.",
          bothChambers: "Unique measures with a verified same-text agreement signal, including passage without amendment, final resolving-differences agreement, presentation, or enactment.",
          presented: "Unique measures with an official Presented to President action.",
        },
      });
      await store.delete(WORKING_KEY);
    } else {
      await store.setJSON(WORKING_KEY, state);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Congress stage index refresh failed", error);
    return new Response(null, { status: 204 });
  }
};

export const config: Config = {
  schedule: "*/2 * * * *",
};
