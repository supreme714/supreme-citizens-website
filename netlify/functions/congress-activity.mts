import type { Config, Context } from "@netlify/functions";

type Bill = {
  introducedDate?: string;
  latestAction?: { actionDate?: string; text?: string };
};

type BillResponse = { bills?: Bill[] };
type LawResponse = { bills?: Bill[]; laws?: Bill[] };
type RecordIssue = {
  issueNumber?: string | number;
  volumeNumber?: string | number;
  issueDate?: string;
  congress?: number | string;
  sessionNumber?: number | string;
};

type UnknownRecord = Record<string, unknown>;

const API_ROOT = "https://api.congress.gov/v3";
const CONGRESS = "119";
const SESSION = "2";\nconst SESSION_START = "2026-01-03";\nconst HOUSE_TYPES = ["hr", "hjres", "hconres", "hres"];\nconst SENATE_TYPES = ["s", "sjres", "sconres", "sres"];

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

async function latestIntroduced(types: string[]): Promise<string> {
  const results = await Promise.all(
    types.map((type) => congressJson<BillResponse>(`/bill/${CONGRESS}/${type}`, { limit: "250", offset: "0" })),
  );

  const dates = results
    .flatMap((data) => data.bills ?? [])
    .map((bill) => bill.introducedDate ?? "")
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  return dates[0] ?? "";
}

async function introducedCounts(types: string[]) {
  const congressResponses = await Promise.all(
    types.map((type) =>
      congressJson<BillResponse>(`/bill/${CONGRESS}/${type}`, {
        limit: "1",
        offset: "0",
        sort: "introducedDate+desc",
      }),
    ),
  );

  const congressTotal = congressResponses.reduce(
    (sum, data) => sum + Number(data.pagination?.count ?? data.bills?.length ?? 0),
    0,
  );

  let sessionTotal = 0;
  for (const type of types) {
    let offset = 0;
    while (true) {
      const data = await congressJson<BillResponse>(`/bill/${CONGRESS}/${type}`, {
        limit: "250",
        offset: String(offset),
        sort: "introducedDate+desc",
      });
      const bills = data.bills ?? [];
      if (!bills.length) break;

      const dates = bills.map((bill) => bill.introducedDate ?? "").filter(Boolean);
      sessionTotal += dates.filter((date) => date >= SESSION_START).length;

      if (dates.some((date) => date < SESSION_START) || bills.length < 250) break;
      offset += bills.length;
      if (offset >= Number(data.pagination?.count ?? offset)) break;
    }
  }

  return { congressTotal, sessionTotal };
}

async function lawCounts() {
  let offset = 0;
  let congressTotal = 0;
  let sessionTotal = 0;

  while (true) {
    const data = await congressJson<LawResponse>(`/law/${CONGRESS}`, {
      limit: "250",
      offset: String(offset),
    });
    const items = Array.isArray(data.bills) ? data.bills : Array.isArray(data.laws) ? data.laws : [];
    if (offset === 0) congressTotal = Number(data.pagination?.count ?? items.length);
    sessionTotal += items.filter((item) => (item.latestAction?.actionDate ?? "") >= SESSION_START).length;

    if (!items.length || items.length < 250) break;
    offset += items.length;
    if (offset >= congressTotal) break;
  }

  return { congressTotal, sessionTotal };
}

async function latestLawDate(): Promise<string> {
  const data = await congressJson<LawResponse>(`/law/${CONGRESS}`, { limit: "1", offset: "0" });
  const items = Array.isArray(data.bills) ? data.bills : Array.isArray(data.laws) ? data.laws : [];
  return items[0]?.latestAction?.actionDate ?? "";
}

function isObject(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function recordIssues(data: unknown): RecordIssue[] {
  const found: RecordIssue[] = [];

  function walk(value: unknown, depth = 0) {
    if (depth > 5 || value == null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, depth + 1));
      return;
    }
    if (!isObject(value)) return;

    if (value.issueDate && value.issueNumber && value.volumeNumber) {
      found.push(value as RecordIssue);
      return;
    }

    for (const child of Object.values(value)) walk(child, depth + 1);
  }

  walk(data);
  return found;
}

function sectionNames(data: unknown): string[] {
  const names: string[] = [];

  function walk(value: unknown, depth = 0, inSections = false) {
    if (depth > 7 || value == null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, depth + 1, inSections));
      return;
    }
    if (!isObject(value)) return;

    if (inSections && typeof value.name === "string") names.push(value.name);

    for (const [key, child] of Object.entries(value)) {
      walk(child, depth + 1, inSections || key === "sections");
    }
  }

  walk(data);
  return names;
}

function isHouseSection(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized === "house" ||
    normalized === "house section" ||
    normalized.includes("house of representatives") ||
    normalized.includes("house proceedings") ||
    normalized.startsWith("house ") ||
    normalized.endsWith(" house")
  );
}

function isSenateSection(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized === "senate" || normalized === "senate section" || normalized.includes("senate proceedings") || normalized.startsWith("senate ") || normalized.endsWith(" senate");
}

async function chamberSessionDays(houseLastIntroduced: string, senateLastIntroduced: string) {
  const data = await congressJson<unknown>("/daily-congressional-record", { limit: "250", offset: "0" });
  const allIssues = recordIssues(data);
  const issues = allIssues
    .filter((issue) => String(issue.congress ?? "") === CONGRESS)
    .filter((issue) => String(issue.sessionNumber ?? "") === SESSION)
    .filter((issue) => Boolean(issue.issueDate && issue.volumeNumber && issue.issueNumber));

  const details = await Promise.all(
    issues.map(async (issue) => {
      const detail = await congressJson<unknown>(
        `/daily-congressional-record/${issue.volumeNumber}/${issue.issueNumber}`,
      );
      const names = sectionNames(detail);
      return {
        date: String(issue.issueDate).slice(0, 10),
        house: names.some(isHouseSection),
        senate: names.some(isSenateSection),
      };
    }),
  );

  const houseDates = [...new Set(details.filter((item) => item.house).map((item) => item.date))].sort();
  const senateDates = [...new Set(details.filter((item) => item.senate).map((item) => item.date))].sort();
  const combinedDates = [...new Set(details.filter((item) => item.house || item.senate).map((item) => item.date))].sort();

  return {
    congressionalRecordDays: combinedDates.length,
    latestCongressionalRecordDate: combinedDates.at(-1) ?? "",
    houseSessionDays: houseDates.length,
    senateSessionDays: senateDates.length,
    houseSessionDaysSinceIntroduced: houseDates.filter((date) => date > houseLastIntroduced).length,
    senateSessionDaysSinceIntroduced: senateDates.filter((date) => date > senateLastIntroduced).length,
    latestHouseSessionDate: houseDates.at(-1) ?? "",
    latestSenateSessionDate: senateDates.at(-1) ?? "",
    recordIssuesExamined: issues.length,
  };
}

export default async (_req: Request, _context: Context) => {
  try {
    const [houseLastIntroduced, senateLastIntroduced, lastBecameLaw] = await Promise.all([
      latestIntroduced(["hr", "hjres", "hconres", "hres"]),
      latestIntroduced(["s", "sjres", "sconres", "sres"]),
      latestLawDate(),
    ]);

    if (!houseLastIntroduced || !senateLastIntroduced || !lastBecameLaw) {
      throw new Error("Congress.gov did not return all tracker dates");
    }

    const [sessionDays, houseIntroduced, senateIntroduced, enacted] = await Promise.all([\n      chamberSessionDays(houseLastIntroduced, senateLastIntroduced),\n      introducedCounts(HOUSE_TYPES),\n      introducedCounts(SENATE_TYPES),\n      lawCounts(),\n    ]);

    return Response.json(
      {
        congress: 119,
        session: 2,
        houseLastIntroduced,
        senateLastIntroduced,
        lastBecameLaw,
        ...sessionDays,
        updatedAt: new Date().toISOString(),
        source: "Congress.gov Daily Congressional Record",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=300",
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  } catch (error) {
    console.error("Congressional activity tracker failed", error);
    return Response.json(
      { error: "Congressional activity temporarily unavailable", updatedAt: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" } },
    );
  }
};

export const config: Config = { path: "/api/congress-activity", method: "GET" };
