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
type RecordResponse = {
  dailyCongressionalRecord?: RecordIssue[] | { issues?: RecordIssue[]; items?: RecordIssue[]; issue?: RecordIssue[] };
  issues?: RecordIssue[];
};
type RecordDetailResponse = {
  issue?: {
    fullIssue?: {
      sections?: { item?: Array<{ name?: string }> } | Array<{ name?: string }>;
    };
  };
};

const API_ROOT = "https://api.congress.gov/v3";
const CONGRESS = "119";
const SESSION = "2";

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

async function latestLawDate(): Promise<string> {
  const data = await congressJson<LawResponse>(`/law/${CONGRESS}`, { limit: "1", offset: "0" });
  const items = Array.isArray(data.bills) ? data.bills : Array.isArray(data.laws) ? data.laws : [];
  return items[0]?.latestAction?.actionDate ?? "";
}

function recordIssues(data: RecordResponse): RecordIssue[] {
  if (Array.isArray(data.dailyCongressionalRecord)) return data.dailyCongressionalRecord;
  if (data.dailyCongressionalRecord && typeof data.dailyCongressionalRecord === "object") {
    const container = data.dailyCongressionalRecord;
    if (Array.isArray(container.issues)) return container.issues;
    if (Array.isArray(container.items)) return container.items;
    if (Array.isArray(container.issue)) return container.issue;
  }
  return Array.isArray(data.issues) ? data.issues : [];
}

function sectionNames(data: RecordDetailResponse): string[] {
  const sections = data.issue?.fullIssue?.sections;
  if (Array.isArray(sections)) return sections.map((item) => item.name ?? "");
  if (sections && Array.isArray(sections.item)) return sections.item.map((item) => item.name ?? "");
  return [];
}

async function chamberSessionDays(houseLastIntroduced: string, senateLastIntroduced: string) {
  const data = await congressJson<RecordResponse>("/daily-congressional-record", { limit: "250", offset: "0" });
  const issues = recordIssues(data)
    .filter((issue) => String(issue.congress ?? "") === CONGRESS)
    .filter((issue) => String(issue.sessionNumber ?? "") === SESSION)
    .filter((issue) => Boolean(issue.issueDate && issue.volumeNumber && issue.issueNumber));

  // The issue-detail endpoint identifies sections such as House and Senate.
  // That lets us count each chamber independently, including pro forma days,
  // rather than treating every Congressional Record issue as a day for both.
  const details = await Promise.all(
    issues.map(async (issue) => {
      const detail = await congressJson<RecordDetailResponse>(
        `/daily-congressional-record/${issue.volumeNumber}/${issue.issueNumber}`,
      );
      const names = sectionNames(detail).map((name) => name.toLowerCase());
      return {
        date: String(issue.issueDate).slice(0, 10),
        house: names.some((name) => name === "house" || name.includes("house of representatives")),
        senate: names.some((name) => name === "senate"),
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

    const sessionDays = await chamberSessionDays(houseLastIntroduced, senateLastIntroduced);

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
