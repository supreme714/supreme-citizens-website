/* Supreme Citizens Election Day countdown.
   Kept in an external file so it runs even when inline JavaScript is restricted by site/browser security policy. */
(function () {
  'use strict';
  var target = new Date('2026-11-03T00:00:00-05:00').getTime();
  var end = new Date('2026-11-04T00:00:00-05:00').getTime();

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function updateElectionCountdown() {
    var clock = document.getElementById('election-countdown-clock');
    var msg = document.getElementById('election-countdown-message');
    if (!clock) return;

    var now = Date.now();
    var diff = target - now;

    if (now >= target && now < end) {
      clock.innerHTML = '<div class="count-box" style="min-width:260px"><strong style="font-size:1.25rem">ELECTION DAY IS TODAY</strong><span>PARTICIPATE · VOTE</span></div>';
      if (msg) msg.innerHTML = 'Election Day Belongs to the People.<span>Voting information &amp; civic resources →</span>';
      return;
    }

    if (now >= end) {
      clock.innerHTML = '<div class="count-box" style="min-width:260px"><strong style="font-size:1.2rem">CITIZENSHIP CONTINUES</strong><span>AFTER ELECTION DAY</span></div>';
      if (msg) msg.innerHTML = 'Stay informed · Stay involved · Stay engaged<span>Follow the civic process →</span>';
      return;
    }

    var total = Math.max(0, Math.floor(diff / 1000));
    setText('count-days', Math.floor(total / 86400));
    setText('count-hours', String(Math.floor((total % 86400) / 3600)).padStart(2, '0'));
    setText('count-minutes', String(Math.floor((total % 3600) / 60)).padStart(2, '0'));
    setText('count-seconds', String(total % 60).padStart(2, '0'));
  }

  function start() {
    updateElectionCountdown();
    window.setInterval(updateElectionCountdown, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();