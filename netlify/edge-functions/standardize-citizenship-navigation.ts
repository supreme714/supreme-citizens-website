export default async (request: Request, context: any) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  const url = new URL(request.url);
  let changed = false;

  // Keep Citizenship & Due Process in the primary navigation immediately
  // after The Charter, while avoiding duplicate links on pages that already
  // contain the static navigation item.
  if (html.includes('class="main-nav"') && !html.includes('href="citizenship.html"')) {
    const active = url.pathname.endsWith("/citizenship.html") ? ' aria-current="page"' : "";
    const citizenshipLink = `<a href="citizenship.html"${active}>Citizenship &amp; Due Process</a>`;
    const charterLinkPattern = /(<a\b[^>]*href=["']charter\.html["'][^>]*>\s*The Charter\s*<\/a>)/i;
    if (charterLinkPattern.test(html)) {
      html = html.replace(charterLinkPattern, `$1\n      ${citizenshipLink}`);
      changed = true;
    }
  }

  // Give Charter readers a prominent direct path to the companion
  // Citizenship & Due Process statement beside the existing 12 Principles
  // reading link. This is intentionally scoped to charter.html only.
  if (url.pathname.endsWith("/charter.html") && html.includes('class="charter-sidebar"')) {
    const principlesButton = /(<a\b[^>]*class=["'][^"']*button[^"']*secondary[^"']*small[^"']*["'][^>]*href=["']principles\.html["'][^>]*>\s*12 Principles\s*<\/a>)/i;
    if (principlesButton.test(html) && !html.includes('class="citizenship-charter-link"')) {
      html = html.replace(
        principlesButton,
        `<a class="button secondary small citizenship-charter-link" href="citizenship.html">Citizenship &amp; Due Process</a>\n      $1`
      );
      changed = true;
    }
  }

  if (!changed) {
    return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};
