import { getStore } from "@netlify/blobs";

const STARTING_COUNT = 411;
const VISITOR_COOKIE = "supreme_citizens_visitor";

export default async (request: Request) => {
  const store = getStore("supreme-citizens-visitors");

  const saved = await store.get("count");
  let count = saved ? Number(saved) : STARTING_COUNT;

  const cookies = request.headers.get("cookie") || "";
  const alreadyCounted = cookies
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${VISITOR_COOKIE}=`));

  if (!alreadyCounted) {
    count += 1;
    await store.set("count", String(count));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (!alreadyCounted) {
    headers["Set-Cookie"] =
      `${VISITOR_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  }

  return new Response(
    JSON.stringify({ count }),
    { headers }
  );
};
