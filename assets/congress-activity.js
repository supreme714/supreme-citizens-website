(() => {
  const house = document.getElementById("house-intro-days");
  const senate = document.getElementById("senate-intro-days");
  const law = document.getElementById("law-enacted-days");
  const houseSession = document.getElementById("house-session-days");
  const senateSession = document.getElementById("senate-session-days");
  const houseSessionSince = document.getElementById("house-session-since");
  const senateSessionSince = document.getElementById("senate-session-since");
  const recordDays = document.getElementById("congress-record-days");
  const recordNote = document.getElementById("congress-record-note");
  const status = document.getElementById("congress-activity-status");
  if (!house || !senate || !law) return;

  function daysSince(value) {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  }

  function setValue(element, value) {
    if (!element) return;
    element.textContent = Number.isFinite(value) ? String(value) : "—";
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  async function refresh() {
    try {
      const response = await fetch("/api/congress-activity", { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!response.ok) throw new Error(`Tracker request failed: ${response.status}`);
      const data = await response.json();

      setValue(house, daysSince(data.houseLastIntroduced));
      setValue(senate, daysSince(data.senateLastIntroduced));
      setValue(law, daysSince(data.lastBecameLaw));
      setValue(houseSession, Number(data.houseSessionDays));
      setValue(senateSession, Number(data.senateSessionDays));
      setValue(recordDays, Number(data.congressionalRecordDays));

      if (houseSessionSince) houseSessionSince.textContent = `${Number(data.houseSessionDaysSinceIntroduced) || 0} session days since last House introduction`;
      if (senateSessionSince) senateSessionSince.textContent = `${Number(data.senateSessionDaysSinceIntroduced) || 0} session days since last Senate introduction`;
      if (recordNote && data.latestCongressionalRecordDate) recordNote.textContent = `Official record through ${formatDate(data.latestCongressionalRecordDate)} · includes pro forma sessions`;

      if (status) {
        const updated = new Date(data.updatedAt);
        status.textContent = `Live from Congress.gov · Updated ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(updated)}`;
      }
    } catch (error) {
      console.error("Unable to load congressional activity tracker:", error);
      [house, senate, law, houseSession, senateSession, recordDays].forEach((element) => setValue(element, null));
      if (houseSessionSince) houseSessionSince.textContent = "Session-day data temporarily unavailable";
      if (senateSessionSince) senateSessionSince.textContent = "Session-day data temporarily unavailable";
      if (status) status.textContent = "Official congressional activity is temporarily unavailable.";
    }
  }

  refresh();
  window.setInterval(refresh, 15 * 60 * 1000);
})();
