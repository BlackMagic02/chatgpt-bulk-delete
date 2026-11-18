(() => {
  const nativeFetch = window.fetch;
  if (typeof nativeFetch !== "function") return;

  function relevant(input, init) {
    const url = new URL(input?.url ?? input, location.href);
    const method = init?.method ?? input?.method ?? "GET";
    return method.toUpperCase() === "GET" && url.origin === location.origin &&
      /^\/backend-api\/(?:[a-z0-9_-]+\/)*conversations\/?$/i.test(url.pathname);
  }

  function publish(data) {
    const rows = Array.isArray(data) ? data : data?.items ?? data?.conversations;
    if (!Array.isArray(rows)) return;
    const dates = [];
    for (const row of rows) {
      const id = row?.conversation_id ?? row?.id;
      const created = row?.create_time ?? row?.created_at;
      if (typeof id !== "string" || !/^[a-z0-9-]{1,100}$/i.test(id)) continue;
      if ((typeof created === "number" && Number.isFinite(created) && created > 0) ||
          (typeof created === "string" && /^\d{4}-\d{2}-\d{2}T/i.test(created) && Number.isFinite(Date.parse(created)))) {
        dates.push([id, created]);
      }
    }
    if (dates.length) window.postMessage({type: "bulk-delete-created-dates", dates}, location.origin);
  }

  window.fetch = function fetch(input, init) {
    const result = Reflect.apply(nativeFetch, this, arguments);
    try {
      if (relevant(input, init)) {
        result.then((response) => {
          if (response.ok && (!response.url || relevant(response.url))) {
            return response.clone().json().then(publish);
          }
        }).catch(() => {});
      }
    } catch {
      // The original fetch handles invalid requests.
    }
    return result;
  };
})();
