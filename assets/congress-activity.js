(() => {
  const byId = (id) => document.getElementById(id);
  const house = byId("house-intro-days");
  const senate = byId("senate-intro-days");
  const law = byId("law-enacted-days");
  const houseSession = byId("house-session-days");
  const senateSession = byId("senate-session-days");
  const houseSessionSince = byId("house-session-since");
  const senateSessionSince = byId("senate-session-since");
  const recordDays = byId("congress-record-days");
  const recordNote = byId("congress-record-note");
  const status = byId("congress-activity-status");
  const houseIntroSession = byId("house-introduced-session");
  const houseIntroCongress = byId("house-introduced-congress");
  const senateIntroSession = byId("senate-introduced-session");
  const senateIntroCongress = byId("senate-introduced-congress");
  const combinedIntroSession = byId("combined-introduced-session");
  const combinedIntroCongress = byId("combined-introduced-congress");
  const enactedSession = byId("enacted-session");
  const enactedCongress = byId("enacted-congress");
  const committeeSession = byId("committee-session");
  const committeeCongress = byId("committee-congress");
  const passedHouseSession = byId("passed-house-session");
  const passedHouseCongress = byId("passed-house-congress");
  const passedSenateSession = byId("passed-senate-session");
  const passedSenateCongress = byId("passed-senate-congress");
  const passedEitherSession = byId("passed-either-session");
  const passedEitherCongress = byId("passed-either-congress");
  const bothChambersSession = byId("both-chambers-session");
  const bothChambersCongress = byId("both-chambers-congress");
  const presentedSession = byId("presented-session");
  const presentedCongress = byId("presented-congress");
  const stageIndexStatus = byId("stage-index-status");
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
      const response = await fetch("/api/congress-activity", {
        headers: { Accept: "application/json" }, cache: "no-store",
      });
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

      setValue(houseIntroSession, Number(data.totals?.introduced?.house?.sessionTotal));
      setValue(houseIntroCongress, Number(data.totals?.introduced?.house?.congressTotal));
      setValue(senateIntroSession, Number(data.totals?.introduced?.senate?.sessionTotal));
      setValue(senateIntroCongress, Number(data.totals?.introduced?.senate?.congressTotal));
      setValue(combinedIntroSession, Number(data.totals?.introduced?.combined?.sessionTotal));
      setValue(combinedIntroCongress, Number(data.totals?.introduced?.combined?.congressTotal));
      setValue(enactedSession, Number(data.totals?.enacted?.sessionTotal));
      setValue(enactedCongress, Number(data.totals?.enacted?.congressTotal));

      const stageCounts = data.stages?.counts;
      if (stageCounts) {
        setValue(committeeSession, Number(stageCounts.committeeAction?.sessionTotal));
        setValue(committeeCongress, Number(stageCounts.committeeAction?.congressTotal));
        setValue(passedHouseSession, Number(stageCounts.passedHouse?.sessionTotal));
        setValue(passedHouseCongress, Number(stageCounts.passedHouse?.congressTotal));
        setValue(passedSenateSession, Number(stageCounts.passedSenate?.sessionTotal));
        setValue(passedSenateCongress, Number(stageCounts.passedSenate?.congressTotal));
        setValue(passedEitherSession, Number(stageCounts.passedEither?.sessionTotal));
        setValue(passedEitherCongress, Number(stageCounts.passedEither?.congressTotal));
        setValue(bothChambersSession, Number(stageCounts.bothChambers?.sessionTotal));
        setValue(bothChambersCongress, Number(stageCounts.bothChambers?.congressTotal));
        setValue(presentedSession, Number(stageCounts.presented?.sessionTotal));
        setValue(presentedCongress, Number(stageCounts.presented?.congressTotal));
        if (stageIndexStatus) stageIndexStatus.textContent = `Verified action-history index completed ${formatDate(data.stages.completedAt)} · ${Number(data.stages.processed || 0).toLocaleString()} measures examined.`;
      } else if (stageIndexStatus) {
        const done = Number(data.stageIndex?.processed || 0);
        const total = Number(data.stageIndex?.totalExpected || 0);
        stageIndexStatus.textContent = total > 0
          ? `Indexing official Congress.gov action histories: ${done.toLocaleString()} of ${total.toLocaleString()} measures examined. Stage totals will appear after the complete verification cycle.`
          : "Official action histories are being indexed. Stage totals will appear after the complete verification cycle.";
      }

      if (status) {
        const updated = new Date(data.updatedAt);
        status.textContent = `Live from Congress.gov · Updated ${new Intl.DateTimeFormat("en-US", {
          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
        }).format(updated)}`;
      }
    } catch (error) {
      console.error("Unable to load congressional activity tracker:", error);
      [house, senate, law, houseSession, senateSession, recordDays, houseIntroSession,
        houseIntroCongress, senateIntroSession, senateIntroCongress, combinedIntroSession,
        combinedIntroCongress, enactedSession, enactedCongress, committeeSession, committeeCongress,
        passedHouseSession, passedHouseCongress, passedSenateSession, passedSenateCongress,
        passedEitherSession, passedEitherCongress, bothChambersSession, bothChambersCongress,
        presentedSession, presentedCongress]
        .forEach((element) => setValue(element, null));
      if (houseSessionSince) houseSessionSince.textContent = "Session-day data temporarily unavailable";
      if (senateSessionSince) senateSessionSince.textContent = "Session-day data temporarily unavailable";
      if (status) status.textContent = "Official congressional activity is temporarily unavailable.";
    }
  }

  refresh();
  window.setInterval(refresh, 15 * 60 * 1000);
})();
