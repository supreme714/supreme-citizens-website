import type { Config, Context } from "@netlify/functions";

type Bill = {
  introducedDate?: string;
  latestAction?: { actionDate?: string; text?: string };
};

type BillResponse = { bills?: Bill[] };
type LawResponse = { bills?: Bill[]; laws?: Bill[] };

const API_ROOT = "https://api.congress.gov/v3";
const CONGRESS = "119";

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

async function latestIntroduced(type: "hr" | "s"): Promise<string> {
  // Congress.gov's bill-list endpoint is sorted by latest action, not by
  // introducedDate. The API does not document a `sort=introducedDate`
  // parameter for this endpoint. Fetch a recent window and select the newest
  // actual introducedDate ourselves so an older bill with a recent action
  // cannot make the counter show hundreds of days.
  const data = await congressJson<BillResponse>(`/bill/${CONGRESS}/${type}`, {
    limit: "250",
    offset: "0",
  });

  const dates = (data.bills ?? [])
    .map((bill) => bill.introducedDate ?? "")
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  return dates[0] ?? "";
}

async function latestLawDate(): Promise<string> {
  const data = await congressJson<LawResponse>(`/law/${CONGRESS}`, {
    limit: "1",
    offset: "0",
  });
  const items = Array.isArray(data.bills) ? data.bills : Array.isArray(data.laws) ? data.laws : [];
  return items[0]?.latestAction?.actionDate ?? "";
}

export default async (_req: Request, _context: Context) => {
  try {
    const [houseLastIntroduced, senateLastIntroduced, lastBecameLaw] = await Promise.all([
      latestIntroduced("hr"),
      latestIntroduced("s"),
      latestLawDate(),
    ]);

    if (!houseLastIntroduced || !senateLastIntroduced || !lastBecameLaw) {
      throw new Error("Congress.gov did not return all tracker dates");
    }

    return Response.json(
      { congress: 119, houseLastIntroduced, senateLastIntroduced, lastBecameLaw, updatedAt: new Date().toISOString(), source: "Congress.gov" },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=300", "Content-Type": "application/json; charset=utf-8" } },
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
