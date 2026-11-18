(() => {
  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== location.origin ||
        event.data?.type !== "bulk-delete-created-dates" || !Array.isArray(event.data.dates)) return;
    const updates = {};
    for (const pair of event.data.dates.slice(0, 2000)) {
      if (!Array.isArray(pair)) continue;
      const [id, raw] = pair;
      if (typeof id !== "string" || !/^[a-z0-9-]{1,100}$/i.test(id)) continue;
      const timestamp = typeof raw === "number" && raw > 0
        ? (raw < 1e12 ? raw * 1000 : raw)
        : typeof raw === "string" && /^\d{4}-\d{2}-\d{2}T/i.test(raw) ? Date.parse(raw) : NaN;
      if (Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp).getTime())) {
        updates["created:" + id] = timestamp;
      }
    }
    if (Object.keys(updates).length) chrome.storage.local.set(updates).catch(() => {});
  });
})();
