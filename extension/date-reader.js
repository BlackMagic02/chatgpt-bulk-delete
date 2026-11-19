(() => {
  const nativeFetch = window.fetch;
  const xhr = window.XMLHttpRequest?.prototype;
  const requests = new WeakMap();

  function historyUrl(input, method = "GET") {
    try {
      const url = new URL(input?.url ?? input, location.href);
      if (String(method).toUpperCase() !== "GET" || url.origin !== location.origin) return false;
      const parts = url.pathname.toLowerCase().split("/").filter(Boolean);
      if (!["backend-api", "backend-anon"].includes(parts[0])) return false;
      const index = parts.findIndex((part) => ["conversations", "conversation", "conversation_history", "conversation-history"].includes(part));
      if (index === -1) return false;
      const suffix = parts.slice(index + 1);
      return (parts[index] !== "conversation" && !suffix.length) ||
        (suffix.length === 1 && ["list", "history", "sidebar"].includes(suffix[0]));
    } catch {
      return false;
    }
  }

  function publish(payload) {
    const dates = new Map();
    const containers = ["data", "payload", "result", "items", "conversations", "results", "edges", "node", "conversation", "pages"];
    function visit(value, depth = 0) {
      if (!value || typeof value !== "object" || depth > 7 || dates.size >= 2000) return;
      if (Array.isArray(value)) {
        for (const entry of value) visit(entry, depth + 1);
        return;
      }
      const id = value.conversation_id ?? value.conversationId ?? value.id;
      const raw = value.create_time ?? value.createTime ?? value.created_at ?? value.createdAt;
      const timestamp = typeof raw === "number" && raw > 0
        ? (raw < 1e12 ? raw * 1000 : raw)
        : typeof raw === "string" && /^\d{4}-\d{2}-\d{2}T/i.test(raw) ? Date.parse(raw) : NaN;
      if (typeof id === "string" && /^[a-z0-9-]{1,100}$/i.test(id) && Number.isFinite(timestamp)) {
        dates.set(id, timestamp);
      }
      for (const key of containers) if (Object.hasOwn(value, key)) visit(value[key], depth + 1);
    }
    // A top-level record is not a history list.
    if (Array.isArray(payload)) visit(payload);
    else for (const key of containers) if (payload && Object.hasOwn(payload, key)) visit(payload[key]);
    if (dates.size) window.postMessage({type: "bulk-delete-created-dates", dates: [...dates]}, location.origin);
  }

  if (typeof nativeFetch === "function") {
    window.fetch = function fetch(input, init) {
      const result = Reflect.apply(nativeFetch, this, arguments);
      if (historyUrl(input, init?.method ?? input?.method)) {
        result.then((response) => {
          if (response.ok && (!response.url || historyUrl(response.url))) {
            return response.clone().json().then(publish);
          }
        }).catch(() => {});
      }
      return result;
    };
  }

  if (xhr) {
    const nativeOpen = xhr.open;
    const nativeSend = xhr.send;
    xhr.open = function open(method, url) {
      const result = Reflect.apply(nativeOpen, this, arguments);
      if (historyUrl(url, method)) requests.set(this, {});
      else requests.delete(this);
      return result;
    };

    xhr.send = function send() {
      const request = requests.get(this);
      if (!request) return Reflect.apply(nativeSend, this, arguments);
      const onLoad = () => {
        if (requests.get(this) !== request || this.status < 200 || this.status >= 300 ||
            (this.responseURL && !historyUrl(this.responseURL))) return;
        try {
          if (this.responseType === "json") publish(this.response);
          if (this.responseType === "" || this.responseType === "text") publish(JSON.parse(this.responseText));
        } catch {
          // A non-JSON response has no creation dates to collect.
        }
      };
      this.addEventListener("load", onLoad, {once: true});
      try {
        return Reflect.apply(nativeSend, this, arguments);
      } catch (error) {
        this.removeEventListener("load", onLoad);
        throw error;
      }
    };
  }
})();
