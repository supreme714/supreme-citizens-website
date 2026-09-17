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

type WhiteHouseItem = {
  date: string;
  title: string;
  type: string;
  url: string;
};

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#038;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function fetchWhiteHouseCategory(
  category: string,
  type: string,
): Promise<WhiteHouseItem[]> {
  const url =
    `https://www.whitehouse.gov/presidential-actions/${category}/feed/`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "SupremeCitizens.org government information service",
    },
  });

  if (!response.ok) {
    throw new Error(
      `WhiteHouse.gov ${type} request failed: ${response.status}`,
    );
  }

  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return items.slice(0, 10).map((match) => {
    const item = match[1];

    const title =
      item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1] ??
      item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ??
      "";

    const link =
      item.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() ?? "";

    const pubDate =
      item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ?? "";

    return {
      date: pubDate ? new Date(pubDate).toISOString() : "",
      title: stripHtml(title),
      type,
      url: link,
    };
  });
}

export default async (_req: Request, _context: Context) => {

  let whiteHouse: WhiteHouseItem[] = [];

  try {
    const [executiveOrders, memoranda] = await Promise.all([
      fetchWhiteHouseCategory("executive-orders", "Executive Order"),
      fetchWhiteHouseCategory(
        "presidential-memoranda",
        "Presidential Memorandum",
      ),
    ]);

    whiteHouse = [...executiveOrders, ...memoranda]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  } catch (error) {
    console.error(
      "White House feed request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
  try {
    const apiKey = Netlify.env.get("CONGRESS_API_KEY");

    if (!apiKey) {
      throw new Error("Congress API key is not configured.");
    }

    const url = new URL("https://api.congress.gov/v3/bill/119");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "250");
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
  ? data.bills
  : [];

const congress = bills
  .sort((a, b) => {
    const dateA = a.latestAction?.actionDate ?? "";
    const dateB = b.latestAction?.actionDate ?? "";
    return dateB.localeCompare(dateA);
  })
  .slice(0, 5)
  .map((bill) => ({
    date: bill.latestAction?.actionDate ?? "",
    identifier: billLabel(bill.type, bill.number),
    title: bill.title ?? "Untitled legislative item",
    latestAction: bill.latestAction?.text ?? "",
    url: congressGovUrl(bill),
  }));

    return Response.json(
      {
        whiteHouse,
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
