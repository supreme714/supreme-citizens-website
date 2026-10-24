export default async (request: Request, context: any) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  if (!html.includes('class="main-nav"') || html.includes('href="citizenship.html"')) {
    return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });
  }

  const url = new URL(request.url);
  const active = url.pathname.endsWith("/citizenship.html") ? ' aria-current="page"' : "";
  const citizenshipLink = `<a href="citizenship.html"${active}>Citizenship &amp; Due Process</a>`;

  const charterLinkPattern = /(<a\b[^>]*href=["']charter\.html["'][^>]*>\s*The Charter\s*<\/a>)/i;
  if (charterLinkPattern.test(html)) {
    html = html.replace(charterLinkPattern, `$1\n      ${citizenshipLink}`);
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};
