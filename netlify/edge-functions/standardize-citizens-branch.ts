export default async (_request: Request, context: any) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();

  const oldBlock = `<div class="section-heading">\n        <p class="eyebrow">The 12 Principles</p>\n        <h2>Putting Supreme Citizenship Into Practice</h2>\n      </div>\n\n      <div class="narrow-text">\n\n        <p>\n          The Supreme Citizens Branch connects civic identity to the\n          <strong>12 Principles of the Supreme Citizen</strong>:\n        </p>\n\n        <p>\n          <strong>Learn • Vote • Choose • Speak • Petition • Assemble •\n          Question • Serve • Respect Rights • Hold Accountable • Preserve\n          Peaceful Succession • Preserve the Republic</strong>\n        </p>\n\n        <p>\n          Together, these principles describe citizenship as an ongoing civic\n          responsibility rather than an activity limited to Election Day.\n        </p>\n\n        <p>\n          <a href="principles.html">Explore the 12 Principles →</a>\n        </p>\n\n      </div>`;

  const newBlock = `<div class="section-heading">\n        <p class="eyebrow">From principle to practice</p>\n        <h2>The 12 Principles and the Civic Actions They Inspire</h2>\n      </div>\n\n      <div class="narrow-text">\n\n        <p>\n          The Supreme Citizens Branch connects civic participation to the\n          <strong>official 12 Principles of the Supreme Citizen</strong>. These principles provide the constitutional and civic framework for understanding the relationship between citizens, public institutions, liberty, accountability, and posterity.\n        </p>\n\n        <p>\n          <strong>Popular Sovereignty • Equal Citizenship • Constitutional Supremacy • Distributed Constitutional Power • Unitary but Limited Executive Authority • Temporary Public Stewardship • Authority Requires Accountability • Protected Liberty and Rule of Law • Checks, Balances, and Institutional Independence • Electoral and Civic Accountability • Constitution Before Party • Posterity</strong>\n        </p>\n\n        <p>\n          Those principles are put into practice through civic actions such as learning, voting when eligible, speaking, petitioning, peacefully assembling, questioning government, serving communities, respecting the rights of others, seeking accountability, supporting peaceful constitutional succession, and preserving the Republic for future generations. These are <strong>civic practices</strong>—not a separate or competing list of the 12 Principles.\n        </p>\n\n        <p>\n          <a href="principles.html">Explore the official 12 Principles →</a> &nbsp;•&nbsp; <a href="participate.html">Put them into practice with the Citizen Action Guide →</a>\n        </p>\n\n      </div>`;

  if (html.includes(oldBlock)) {
    html = html.replace(oldBlock, newBlock);
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};
