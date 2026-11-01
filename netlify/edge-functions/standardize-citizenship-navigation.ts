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
  const primaryNavMatch = html.match(/<nav\b[^>]*class=["'][^"']*main-nav[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);
  const primaryNav = primaryNavMatch ? primaryNavMatch[0] : "";

  if (primaryNav && !primaryNav.includes('href="citizenship.html"')) {
    const active = url.pathname.endsWith("/citizenship.html") ? ' aria-current="page"' : "";
    const citizenshipLink = `<a href="citizenship.html"${active}>Citizenship &amp; Due Process</a>`;
    const charterLinkPattern = /(<a\b[^>]*href=["']charter\.html["'][^>]*>\s*The Charter\s*<\/a>)/i;
    if (charterLinkPattern.test(html)) {
      html = html.replace(charterLinkPattern, `$1\n      ${citizenshipLink}`);
      changed = true;
    }
  }

  // Keep Congressional Activity in the primary navigation immediately after
  // Supreme Citizen and before Citizens Branch on every HTML page.
  const activityNavMatch = html.match(/<nav\b[^>]*class=["'][^"']*main-nav[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);
  const activityNav = activityNavMatch ? activityNavMatch[0] : "";

  if (activityNav && !activityNav.includes('href="congressional-activity.html"')) {
    const active = url.pathname.endsWith("/congressional-activity.html") ? ' aria-current="page"' : "";
    const activityLink = `<a href="congressional-activity.html"${active}>Congressional Activity</a>`;
    const supremeCitizenPattern = /(<a\b[^>]*href=["']identity\.html["'][^>]*>\s*Supreme Citizen\s*<\/a>)/i;
    if (supremeCitizenPattern.test(html)) {
      html = html.replace(supremeCitizenPattern, `$1\n      ${activityLink}`);
      changed = true;
    }
  }

  // Keep January 6 in the primary navigation immediately after Participate.
  // Check only the primary navigation for an existing link. The homepage can
  // contain January 6 links elsewhere in its content without suppressing the
  // navigation item.
  const refreshedNavMatch = html.match(/<nav\b[^>]*class=["'][^"']*main-nav[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);
  const refreshedNav = refreshedNavMatch ? refreshedNavMatch[0] : "";

  if (refreshedNav && !refreshedNav.includes('href="january-6.html"')) {
    const active = url.pathname.endsWith("/january-6.html") || url.pathname.includes("/j6-")
      ? ' aria-current="page"'
      : "";
    const january6Link = `<a href="january-6.html"${active}>January 6</a>`;
    const participateLinkPattern = /(<a\b[^>]*href=["']participate\.html["'][^>]*>\s*Participate\s*<\/a>)/i;
    if (participateLinkPattern.test(html)) {
      html = html.replace(participateLinkPattern, `$1\n      ${january6Link}`);
      changed = true;
    }
  }

  // Standardize the January 6 project subnavigation across every J6 page.
  const j6NavMatch = html.match(/<nav\b[^>]*class=["'][^"']*j6-subnav[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);
  if (j6NavMatch) {
    let j6Nav = j6NavMatch[0];
    let navChanged = false;

    if (!j6Nav.includes('href="j6-research-index.html"')) {
      const active = url.pathname.endsWith("/j6-research-index.html") ? ' aria-current="page"' : "";
      const link = `<a href="j6-research-index.html"${active}>Research Index</a>`;
      const youDecidePattern = /(<a\b[^>]*href=["']j6-you-decide\.html["'][^>]*>\s*You Decide\s*<\/a>)/i;
      if (youDecidePattern.test(j6Nav)) {
        j6Nav = j6Nav.replace(youDecidePattern, `$1${link}`);
        navChanged = true;
      }
    }

    if (!j6Nav.includes('href="j6-record-maintenance.html"')) {
      const active = url.pathname.endsWith("/j6-record-maintenance.html") ? ' aria-current="page"' : "";
      const link = `<a href="j6-record-maintenance.html"${active}>Record Maintenance</a>`;
      const researchPattern = /(<a\b[^>]*href=["']j6-research-index\.html["'][^>]*>\s*Research Index\s*<\/a>)/i;
      if (researchPattern.test(j6Nav)) {
        j6Nav = j6Nav.replace(researchPattern, `$1${link}`);
        navChanged = true;
      }
    }

    if (navChanged) {
      html = html.replace(j6NavMatch[0], j6Nav);
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
