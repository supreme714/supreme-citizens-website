(() => {
  const house = document.getElementById("house-intro-days");
  const senate = document.getElementById("senate-intro-days");
  const law = document.getElementById("law-enacted-days");
  const status = document.getElementById("congress-activity-status");
  if (!house || !senate || !law) return;

  function daysSince(value) {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  }

  function setValue(element, value) {
    element.textContent = Number.isFinite(value) ? String(value) : "—";
  }

  async function refresh() {
    try {
      const response = await fetch("/api/congress-activity", { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!response.ok) throw new Error(`Tracker request failed: ${response.status}`);
      const data = await response.json();
      setValue(house, daysSince(data.houseLastIntroduced));
      setValue(senate, daysSince(data.senateLastIntroduced));
      setValue(law, daysSince(data.lastBecameLaw));
      if (status) {
        const updated = new Date(data.updatedAt);
        status.textContent = `Live from Congress.gov · Updated ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(updated)}`;
      }
    } catch (error) {
      console.error("Unable to load congressional activity tracker:", error);
      setValue(house, null);
      setValue(senate, null);
      setValue(law, null);
      if (status) status.textContent = "Official congressional activity is temporarily unavailable.";
    }
  }

  refresh();
  window.setInterval(refresh, 15 * 60 * 1000);
})();
