import { getStore } from "@netlify/blobs";

const STARTING_COUNT = 411;

export default async () => {
  const store = getStore("supreme-citizens-visitors");

  const saved = await store.get("count");
  let count = saved ? Number(saved) : STARTING_COUNT;

  count += 1;

  await store.set("count", String(count));

  return new Response(
    JSON.stringify({ count }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
};
