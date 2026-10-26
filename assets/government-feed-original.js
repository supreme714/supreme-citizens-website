(() => {
  const whiteHouseFeed = document.getElementById("white-house-feed");
  const congressFeed = document.getElementById("congress-feed");
  const supremeCourtFeed = document.getElementById("supreme-court-feed");
  const lastUpdated = document.getElementById("government-last-updated");

  if (!congressFeed) return;

  const FALLBACK_TEXT = "Latest information temporarily unavailable.";

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function createItem(item) {
    const article = document.createElement("article");
    article.className = "government-item";

    const meta = document.createElement("p");
    meta.className = "government-item-meta";

    const metaParts = [];

    if (item.date) {
      metaParts.push(formatDate(item.date));
    }

    if (item.identifier) {
      metaParts.push(item.identifier);
    }

    meta.textContent = metaParts.join(" • ");

    const heading = document.createElement("h4");
    const link = document.createElement("a");

    link.href = item.url || "https://www.congress.gov/";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.title || "Congressional activity";

    heading.appendChild(link);

    article.appendChild(meta);
    article.appendChild(heading);

    if (item.latestAction) {
      const action = document.createElement("p");
      action.className = "government-item-action";
      action.textContent = item.latestAction;
      article.appendChild(action);
    }

    return article;
  }
  
  function createWhiteHouseItem(item) {
  const article = document.createElement("article");
  article.className = "government-item";

  const meta = document.createElement("p");
  meta.className = "government-item-meta";

  const metaParts = [];

  if (item.date) {
    const date = new Date(item.date);

    if (!Number.isNaN(date.getTime())) {
      metaParts.push(
        new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(date),
      );
    }
  }

  if (item.type) {
    metaParts.push(item.type);
  }

  meta.textContent = metaParts.join(" • ");

  const heading = document.createElement("h4");
  const link = document.createElement("a");

  link.href =
    item.url || "https://www.whitehouse.gov/presidential-actions/";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = item.title || "Presidential Action";

  heading.appendChild(link);
  article.appendChild(meta);
  article.appendChild(heading);

  return article;
}

function renderWhiteHouse(items) {
  if (!whiteHouseFeed) return;

  whiteHouseFeed.replaceChildren();

  if (!Array.isArray(items) || items.length === 0) {
    const message = document.createElement("p");
    message.className = "government-error";
    message.textContent = FALLBACK_TEXT;
    whiteHouseFeed.appendChild(message);
    return;
  }

  items.slice(0, 5).forEach((item) => {
    whiteHouseFeed.appendChild(createWhiteHouseItem(item));
  });
}
  
function createSupremeCourtItem(item) {
  const article = document.createElement("article");
  article.className = "government-item";

  const meta = document.createElement("p");
  meta.className = "government-item-meta";

  const metaParts = [];

  if (item.date) {
    const date = new Date(item.date);

    if (!Number.isNaN(date.getTime())) {
      metaParts.push(
        new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(date),
      );
    }
  }

  if (item.type) {
    metaParts.push(item.type);
  }

  meta.textContent = metaParts.join(" • ");

  const heading = document.createElement("h4");
  const link = document.createElement("a");

  link.href = item.url || "https://www.supremecourt.gov/";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = item.title || "Supreme Court activity";

  heading.appendChild(link);
  article.appendChild(meta);
  article.appendChild(heading);

  return article;
}

function renderSupremeCourt(items) {
  if (!supremeCourtFeed) return;

  supremeCourtFeed.replaceChildren();

  if (!Array.isArray(items) || items.length === 0) {
    const message = document.createElement("p");
    message.className = "government-error";
    message.textContent = FALLBACK_TEXT;
    supremeCourtFeed.appendChild(message);
    return;
  }

  items.slice(0, 5).forEach((item) => {
    supremeCourtFeed.appendChild(createSupremeCourtItem(item));
  });
}
  function showFallback() {
    congressFeed.replaceChildren();

    const message = document.createElement("p");
    message.className = "government-error";
    message.textContent = FALLBACK_TEXT;

    congressFeed.appendChild(message);
  }

  function renderCongress(items) {
    congressFeed.replaceChildren();

    if (!Array.isArray(items) || items.length === 0) {
      showFallback();
      return;
    }

    items.slice(0, 5).forEach((item) => {
      congressFeed.appendChild(createItem(item));
    });
  }

  function updateTimestamp(value) {
    if (!lastUpdated || !value) return;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return;

    lastUpdated.textContent =
      `Last updated ${new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date)}`;
  }

  async function loadCongress() {
    try {
      const response = await fetch("/api/government-feed", {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Government feed request failed: ${response.status}`);
      }

      const data = await response.json();

renderWhiteHouse(data.whiteHouse);
renderSupremeCourt(data.supremeCourt);
renderCongress(data.congress);
updateTimestamp(data.updatedAt);
    } catch (error) {
      console.error("Unable to load Congress feed:", error);
      renderWhiteHouse([]);
      renderSupremeCourt([]);
      showFallback();

      if (lastUpdated) {
        lastUpdated.textContent =
          "Latest government information temporarily unavailable";
      }
    }
  }

  loadCongress();

  window.setInterval(loadCongress, 15 * 60 * 1000);
})();
