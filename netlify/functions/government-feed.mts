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

  const typePaths: Record<string, string> = {
    hr: "house-bill",
    s: "senate-bill",
    hjres: "house-joint-resolution",
    sjres: "senate-joint-resolution",
    hconres: "house-concurrent-resolution",
    sconres: "senate-concurrent-resolution",
    hres: "house-resolution",
    sres: "senate-resolution",
  };

  const typePath = typePaths[type];

  if (!typePath || !congress || !number) {
    return "https://www.congress.gov/";
  }

  return `https://www.congress.gov/bill/${congress}th-congress/${typePath}/${number}`;
}

type WhiteHouseItem = {
  date: string;
  title: string;
  type: string;
  url: string;
};
type SupremeCourtItem = {
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
async function fetchSupremeCourtOrders(): Promise<SupremeCourtItem[]> {
  const url = "https://www.supremecourt.gov/orders/ordersofthecourt";

  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "SupremeCitizens.org government information service",
    },
  });

  if (!response.ok) {
    throw new Error(
      `SupremeCourt.gov orders request failed: ${response.status}`,
    );
  }

  const html = await response.text();

  const linkPattern =
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  const items: SupremeCourtItem[] = [];

  for (const match of html.matchAll(linkPattern)) {
    const href = match[1];
    const text = stripHtml(match[2]).replace(/\s+/g, " ").trim();

    if (!/Order List|Miscellaneous Order/i.test(text)) {
      continue;
    }

    const beforeLink = html.slice(
      Math.max(0, match.index! - 250),
      match.index,
    );

    const dateMatch = beforeLink.match(
      /(\d{1,2}\/\d{1,2}\/\d{2})(?![\s\S]*\d{1,2}\/\d{1,2}\/\d{2})/,
    );

    if (!dateMatch) {
      continue;
    }

    const date = new Date(`${dateMatch[1]} 12:00:00`);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    items.push({
      date: date.toISOString(),
      title: text,
      type: /Miscellaneous/i.test(text)
        ? "Miscellaneous Order"
        : "Order List",
      url: href.startsWith("http")
        ? href
        : `https://www.supremecourt.gov${href.startsWith("/") ? "" : "/"}${href}`,
    });
  }

  return items
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}
async function fetchSupremeCourtOpinions(): Promise<SupremeCourtItem[]> {
  const url = "https://www.supremecourt.gov/opinions/slipopinion";

  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "SupremeCitizens.org government information service",
    },
  });

  if (!response.ok) {
    throw new Error(
      `SupremeCourt.gov opinions request failed: ${response.status}`,
    );
  }

  const html = await response.text();
  const items: SupremeCourtItem[] = [];

  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;

  for (const rowMatch of html.matchAll(rowPattern)) {
    const row = rowMatch[1];

    const pdfMatch = row.match(
      /<a[^>]+href=["']([^"']*\/opinions\/[^"']+\.pdf)["'][^>]*>([\s\S]*?)<\/a>/i,
    );

    if (!pdfMatch) {
      continue;
    }

    const href = pdfMatch[1];

    const cellMatches = [
      ...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi),
    ];

    const cells = cellMatches.map((cell) =>
      stripHtml(cell[1]).replace(/\s+/g, " ").trim()
    );

    const dateText = cells.find((cell) =>
      /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(cell)
    );

    if (!dateText) {
      continue;
    }

    const date = new Date(`${dateText} 12:00:00`);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const linkText = stripHtml(pdfMatch[2])
      .replace(/\s+/g, " ")
      .trim();

    let title = linkText;

    if (!title || /^\d+\s*[-–]\s*\d+$/i.test(title)) {
      const usefulCells = cells.filter(
        (cell) =>
          cell &&
          cell !== dateText &&
          !/^\d+\s*[-–]\s*\d+$/.test(cell)
      );

      title =
        usefulCells.find((cell) =>
          / v\. | in re | ex rel\.|department|united states/i.test(cell)
        ) ??
        usefulCells[0] ??
        "Supreme Court Opinion";
    }

    items.push({
      date: date.toISOString(),
      title,
      type: "Opinion",
      url: href.startsWith("http")
        ? href
        : `https://www.supremecourt.gov${href.startsWith("/") ? "" : "/"}${href}`,
    });
  }

  return items
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

export default async (_req: Request, _context: Context) => {

  let whiteHouse: WhiteHouseItem[] = [];
  let supremeCourt: SupremeCourtItem[] = [];

const [ordersResult, opinionsResult] = await Promise.allSettled([
  fetchSupremeCourtOrders(),
  fetchSupremeCourtOpinions(),
]);

if (ordersResult.status === "rejected") {
  console.error(
    "Supreme Court orders request failed:",
    ordersResult.reason instanceof Error
      ? ordersResult.reason.message
      : "Unknown error",
  );
}

if (opinionsResult.status === "rejected") {
  console.error(
    "Supreme Court opinions request failed:",
    opinionsResult.reason instanceof Error
      ? opinionsResult.reason.message
      : "Unknown error",
  );
}

supremeCourt = [
  ...(ordersResult.status === "fulfilled" ? ordersResult.value : []),
  ...(opinionsResult.status === "fulfilled" ? opinionsResult.value : []),
]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5);
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
        supremeCourt,
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
    whiteHouse,
    supremeCourt,
    congress: [],
    updatedAt: new Date().toISOString(),
    error: "Congress information temporarily unavailable",
  },
  {
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
