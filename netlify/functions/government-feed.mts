import type { Config, Context } from "@netlify/functions";

type CongressBill = {
  congress?: number;
  type?: string;
  number?: string;
  title?: string;
  latestAction?: {
    actionDate?: string;
    text?: string;
  };
};

function billLabel(type = "", number = "") {
  const labels: Record<string, string> = {
    HR: "H.R.",
    S: "S.",
    HJRES: "H.J.Res.",
    SJRES: "S.J.Res.",
    HCONRES: "H.Con.Res.",
    SCONRES: "S.Con.Res.",
    HRES: "H.Res.",
    SRES: "S.Res.",
  };

  return `${labels[type.toUpperCase()] ?? type} ${number}`.trim();
}

function congressGovUrl(bill: CongressBill) {
  const type = (bill.type ?? "").toLowerCase();
  const congress = bill.congress ?? "";
  const number = bill.number ?? "";

  return `https://www.congress.gov/bill/${congress}th-congress/${type}/${number}`;
}

export default async (_req: Request, _context: Context) => {
  try {
    const apiKey = Netlify.env.get("CONGRESS_API_KEY");

    if (!apiKey) {
      throw new Error("Congress API key is not configured.");
    }

    const url = new URL("https://api.congress.gov/v3/bill/119");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("offset", "0");

    const response = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Congress.gov request failed: ${response.status}`);
    }

    const data = await response.json();
    const bills: CongressBill[] = Array.isArray(data?.bills)
      ? data.bills.slice(0, 5)
      : [];

    const congress = bills.map((bill) => ({
      date: bill.latestAction?.actionDate ?? "",
      identifier: billLabel(bill.type, bill.number),
      title: bill.title ?? "Untitled legislative item",
      latestAction: bill.latestAction?.text ?? "",
      url: congressGovUrl(bill),
    }));

    return Response.json(
      {
        congress,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=900",
        },
      },
    );
  } catch (error) {
    console.error(
      "Government feed request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return Response.json(
      {
        congress: [],
        updatedAt: new Date().toISOString(),
        error: "Latest information temporarily unavailable",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
};

export const config: Config = {
  path: "/api/government-feed",
};
