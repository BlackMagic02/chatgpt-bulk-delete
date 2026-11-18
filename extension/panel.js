(() => {
  const panelId = "chatgpt-bulk-delete-extension";
  const existing = document.getElementById(panelId);
  if (existing) {
    existing.hidden = false;
    existing.dispatchEvent(new Event("bulk-history-open"));
    return;
  }

  const host = document.createElement("div");
  host.id = panelId;
  const shadow = host.attachShadow({mode: "open"});
  shadow.innerHTML = `<style>
    :host {
      color-scheme:light dark;
      --surface:#fff; --soft:#f6f7f9; --line:#e5e7eb; --ink:#18202e; --muted:#596475;
      --accent:#2856aa; --selected:#ebf2ff; --danger:#b4232c; --danger-hover:#951d25;
      position:fixed; top:16px; right:16px; z-index:2147483647; pointer-events:auto;
      width:min(420px,calc(100vw - 32px)); color:var(--ink); font:14px/1.45 system-ui,sans-serif;
    }
    @media (prefers-color-scheme:dark) {
      :host { --surface:#202329; --soft:#2a2e36; --line:#3b414d; --ink:#f1f4fa; --muted:#b1bbcb;
        --accent:#a9c4ff; --selected:#293956; --danger:#b4232c; --danger-hover:#ca303b; }
    }
    * { box-sizing:border-box; }
    [hidden], :host([hidden]) { display:none !important; }
    section { background:var(--surface); border:1px solid var(--line); border-radius:18px;
      box-shadow:0 12px 48px #10182733; overflow:auto; max-height:calc(100dvh - 32px); }
    header, .toolbar, .footer, .dates, .search { display:flex; align-items:center; gap:8px; }
    header { padding:12px 16px; border-bottom:1px solid var(--line); }
    h2 { margin:0 auto 0 0; font-size:16px; font-weight:650; }
    p { margin:0; }
    .filters { padding:12px 16px 8px; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:8px; }
    .modes { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:4px; margin:12px 16px 0; padding:3px;
      background:var(--soft); border-radius:10px; }
    .modes button { border-color:transparent; background:transparent; white-space:nowrap; padding-inline:4px; }
    .modes button[aria-pressed=true] { background:var(--surface); border-color:var(--line); font-weight:650; }
    .footer { flex-wrap:wrap; }
    #selection { flex:1; min-width:0; }
    .dates { align-items:end; }
    #review .footer { justify-content:flex-end; }
    #back { margin-right:auto; }
    .search, .dates, #dateHint { grid-column:1 / -1; }
    .search { position:relative; }
    .search span { position:absolute; left:10px; color:var(--muted); pointer-events:none; }
    .search input[type=search] { width:100%; padding-left:34px; }
    .field { display:grid; gap:4px; color:var(--muted); font-size:12px; min-width:0; }
    .field select { min-width:0; width:100%; }
    .dates { flex-wrap:wrap; }
    input:not([type=checkbox]), select, button { min-height:32px; font:inherit; border-radius:8px;
      border:1px solid var(--line); padding:5px 8px; color:var(--ink); background:var(--surface); }
    input:not([type=checkbox]), select { background:var(--soft); }
    button { cursor:pointer; }
    button:hover:not(:disabled) { background:var(--soft); }
    button:disabled { cursor:default; opacity:.5; }
    :focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
    .icon, .quiet, .grip { border-color:transparent; background:transparent; }
    .icon { width:32px; padding:0; display:grid; place-items:center; color:var(--muted); }
    svg { width:18px; height:18px; }
    .quiet { color:var(--accent); }
    .toolbar { min-height:40px; padding:0 16px; border-bottom:1px solid var(--line); }
    #count { margin-right:auto; }
    .note, #count, #scanStatus, #selection, .meta { color:var(--muted); font-size:12px; }
    #scanStatus { padding:5px 16px; }
    #scanStatus:empty, #status:empty { display:none; }
    ul { padding:4px 10px; margin:0; max-height:min(43dvh,380px); overflow:auto; list-style:none; }
    li { overflow-wrap:anywhere; }
    #list { user-select:none; }
    #list li { display:flex; align-items:center; border-radius:8px; }
    #list li:hover { background:var(--soft); }
    #list li:has(input:checked) { background:var(--selected); }
    #list label { flex:1; cursor:pointer; display:flex; align-items:center; gap:9px; min-height:38px; padding:5px 9px 5px 0; }
    input[type=checkbox] { width:16px; height:16px; accent-color:var(--accent); flex:none; margin:0; }
    .grip { min-height:28px; padding:0 5px; color:var(--muted); cursor:ns-resize; touch-action:none; }
    .meta { display:block; }
    .type-icon { position:relative; display:inline-grid; place-items:center; flex:none; width:26px; height:26px;
      border-radius:7px; background:#fff1d6; color:#8a4b05; }
    .type-icon::before, .type-icon::after { content:""; position:absolute; }
    .type-icon.project::before { width:13px; height:9px; top:9px; border:1.5px solid currentColor; border-radius:2px; }
    .type-icon.project::after { width:5px; height:3px; top:6px; left:6px;
      border:1.5px solid currentColor; border-bottom:0; border-radius:2px 2px 0 0; }
    .type-icon.session { background:#e7f1ff; color:#245aa5; }
    .type-icon.session::before { width:12px; height:9px; top:6px; border:1.5px solid currentColor; border-radius:3px; }
    .type-icon.session::after { width:4px; height:4px; top:16px; left:8px; background:inherit;
      border-left:1.5px solid currentColor; border-bottom:1.5px solid currentColor; transform:skewY(-40deg); }
    @media (prefers-color-scheme:dark) {
      .type-icon.project { background:#49371f; color:#ffcc79; }
      .type-icon.session { background:#283e5e; color:#a8cdff; }
    }
    .row-text { min-width:0; }
    #queue li { display:flex; align-items:center; gap:9px; }
    .empty { margin:0; padding:24px 16px; text-align:center; color:var(--muted); }
    .footer { justify-content:space-between; padding:10px 16px; border-top:1px solid var(--line); }
    .footer button { white-space:nowrap; }
    .danger, .danger:hover:not(:disabled) { color:#fff; background:var(--danger); border-color:var(--danger); padding-inline:12px; }
    .danger:hover:not(:disabled) { background:var(--danger-hover); }
    #summary { padding:14px 16px 3px; font-weight:650; font-size:16px; }
    #review .note { padding:0 16px 8px; }
    #queue { padding:0 16px 10px; }
    #queue li { padding:7px 0; border-top:1px solid var(--line); }
    #status { padding:8px 16px; border-top:1px solid var(--line); font-size:12px; }
  </style>
  <section aria-label="ChatGPT 对话批量删除">
    <header>
      <h2 title="Beta 0.0.1">批量删除对话</h2>
      <button id="refresh" class="icon" aria-label="重新加载对话" title="重新加载对话"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 6.7M20 5v6h-6"/></svg></button>
      <button id="close" class="icon" aria-label="关闭面板" title="关闭面板"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </header>
    <div id="pick">
      <div class="modes" role="group" aria-label="选择删除对象">
        <button type="button" data-mode="chat" aria-pressed="true">普通聊天</button>
        <button type="button" data-mode="session" aria-pressed="false">项目内对话</button>
        <button type="button" data-mode="project" aria-pressed="false">整个项目</button>
      </div>
      <div class="filters">
        <div class="search"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/></svg></span><input id="filter" type="search" placeholder="搜索对话标题" aria-label="搜索对话标题"></div>
        <label class="field" id="projectField" hidden>项目 <select id="project"><option value="">所有项目</option></select></label>
        <label class="field" id="dateModeField">创建日期 <select id="dateMode">
          <option value="">不限日期</option><option value="before">早于</option>
          <option value="after">晚于</option><option value="range">日期范围</option>
        </select></label>
        <div class="dates" id="dateFields" hidden>
          <label id="fromLabel" class="field" hidden><span id="fromText">从</span><input id="from" type="date"></label>
          <label id="toLabel" class="field" hidden><span id="toText">到</span><input id="to" type="date"></label>
          <button id="clearDates" class="quiet" hidden>清除</button>
        </div>
        <p id="dateHint" class="note" role="status" hidden></p>
      </div>
      <div class="toolbar">
        <p id="count"></p><button id="stopScan" class="quiet" hidden>停止加载</button><button id="all" class="quiet">全选</button>
      </div>
      <p id="scanStatus" role="status"></p>
      <ul id="list" aria-label="对话列表"></ul>
      <p id="empty" class="empty" hidden></p>
      <div class="footer">
        <p id="selection"></p><button id="clear" class="quiet" hidden>取消选择</button>
        <button id="preview" class="danger">批量删除</button>
      </div>
    </div>
    <div id="review" hidden>
      <p id="summary"></p>
      <p class="note" id="warning">删除后无法恢复。</p>
      <ul id="queue" aria-label="待删除对话"></ul>
      <div class="footer">
        <button id="back">返回</button><button id="run" class="danger">确认删除</button><button id="stop" hidden>停止删除</button>
      </div>
    </div>
    <p id="status" role="status"></p>
  </section>`;
  document.body.append(host);

  const ui = (id) => shadow.getElementById(id);
  const selected = new Set();
  let items = new Map();
  let view = "chat";
  let batch = [];
  let sourceNav = null;
  const savedDates = new Map();
  const projectNames = new Map();
  const unnamedProjects = new Map();
  const storage = globalThis.chrome?.storage;
  let drag = null;
  let scan = null;
  let readTimer;
  let previousActiveProject = "";
  let pageUrl = "";
  let running = false;
  let stopped = false;
  const deleteLabels = new Set(["delete", "delete chat", "delete conversation", "删除", "删除聊天", "删除对话", "刪除", "刪除聊天", "刪除對話"]);
  const projectDeleteLabels = new Set(["delete project", "删除项目", "刪除專案", "刪除項目"]);
  const projectConfirmationLabels = new Set([
    ...projectDeleteLabels, "delete", "删除", "刪除",
    "从聊天和工作中删除", "從聊天和工作中刪除", "delete from chat and work"
  ]);
  const projectRowSelector = "[data-app-action-sidebar-project-row][data-app-action-sidebar-project-id]";
  const targetsSelector = "a[href], " + projectRowSelector;
  const menuSelector = '[role="menu"]';
  const dialogSelector = '[role="dialog"], [role="alertdialog"], dialog[open]';
  const triggerSelector = 'button[aria-haspopup="menu"], button[data-testid^="history-item-"][data-testid$="-options"], button[data-testid^="project-"][data-testid$="-options"]';

  function chatId(link) {
    const url = new URL(link.href, location.href);
    return url.origin === location.origin ? /^(?:\/g\/g-p-[^/]+)?\/c\/([a-z0-9-]+)\/?$/i.exec(url.pathname)?.[1] : undefined;
  }

  function rendered(node) {
    return node.isConnected && node.getClientRects().length > 0 &&
      getComputedStyle(node).visibility === "visible";
  }

  function visible(node) {
    return rendered(node) && !node.closest('[aria-hidden="true"]');
  }

  function links(root) {
    return [...root.querySelectorAll('a[href]')].filter((link) => chatId(link) && visible(link));
  }

  function projectId(pathname) {
    return /^\/g\/(g-p-[0-9a-f]+)(?:-[^/]+)?\/(?:project\/?$|c\/[^/]+\/?$)/i.exec(pathname)?.[1] || "";
  }

  function projectLinkId(link) {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return "";
    const path = url.pathname.replace(/\/$/, "");
    if (!/^\/g\/g-p-[^/]+(?:\/project)?$/i.test(path)) return "";
    return projectId(path.endsWith("/project") ? path : path + "/project");
  }

  function projectScope(link, root) {
    for (let node = link; node && node !== root; node = node.parentElement) {
      const id = sidebarProjectId(node) || node.getAttribute("data-project-id");
      if (id && /^[a-f0-9]{8,}$/i.test(id)) return "g-p-" + id;
      if (id && /^g-p-[a-f0-9]+$/i.test(id)) return id;
      if (node.matches('li, [role=treeitem], [data-testid^="project-"]')) {
        const headerIds = new Set(
          [...node.querySelectorAll('a[href]')].map(projectLinkId).filter(Boolean)
        );
        if (headerIds.size === 1) return headerIds.values().next().value;
      }
    }
    return "";
  }

  function sidebarProjectId(node) {
    const id = node.getAttribute("data-app-action-sidebar-project-id");
    return /^g-p-[a-f0-9]+$/i.test(id || "") ? id : "";
  }

  function itemId(node, kind) {
    return kind === "project" ? (sidebarProjectId(node) || (node.matches("a[href]") ? projectLinkId(node) : "")) :
      node.matches("a[href]") ? chatId(node) : "";
  }

  function matchingTargets(root, item) {
    return [...root.querySelectorAll(targetsSelector)].filter((node) => itemId(node, item.kind) === item.id);
  }

  function targetTitle(link, kind) {
    if (kind !== "project") return link.textContent.trim();
    return readableProjectName(link.getAttribute("data-app-action-sidebar-project-label")) ||
      readableProjectName(link.getAttribute("title")) ||
      readableProjectName(link.querySelector('[data-testid*="project-name"]')?.textContent) ||
      readableProjectName(link.textContent) || readableProjectName(link.getAttribute("aria-label"));
  }

  function readableProjectName(text) {
    const name = text?.trim();
    return name && !/^g-p-[0-9a-f]+(?:-.*)?$/i.test(name) ? name : "";
  }

  function projectNameFor(id) {
    if (projectNames.has(id)) return projectNames.get(id);
    if (!unnamedProjects.has(id)) unnamedProjects.set(id, unnamedProjects.size + 1);
    return "名称未识别的项目 " + unnamedProjects.get(id);
  }

  function localDate(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((part) => String(part).padStart(2, "0")).join("-");
  }

  function dateFor(item) {
    return item.date || localDate(savedDates.get(item.id));
  }

  function read({keepStatus = false} = {}) {
    const activeProject = projectId(location.pathname);
    const onProjectList = !!activeProject && /\/project\/?$/.test(location.pathname);
    const projectLinks = [...document.querySelectorAll('nav a[href], [role=navigation] a[href], aside a[href], [data-testid^="project"] a[href]')]
      .filter((link) => projectLinkId(link));
    for (const link of projectLinks) {
      const name = targetTitle(link, "project");
      if (name) projectNames.set(projectLinkId(link), name);
    }
    const projectRows = [...document.querySelectorAll(projectRowSelector)];
    for (const row of projectRows) {
      const id = sidebarProjectId(row);
      const name = targetTitle(row, "project");
      if (id && name) projectNames.set(id, name);
    }
    if (onProjectList) {
      const heading = readableProjectName(document.querySelector('main h1, [role=main] h1')?.textContent);
      if (heading && !projectNames.has(activeProject)) projectNames.set(activeProject, heading);
    }
    const next = new Map();
    for (const link of links(document)) {
      const nav = link.closest("nav, [role=navigation]");
      const main = !nav && onProjectList && link.closest("main, [role=main]");
      const root = nav || main;
      const title = link.textContent.trim();
      const row = root && findRow(link, root);
      if (!row || !title) continue;
      const id = chatId(link);
      const project = projectId(new URL(link.href).pathname) || projectScope(link, root) || (main ? activeProject : "");
      const created = row.getAttribute("data-created-at") || row.querySelector("time[data-created][datetime]")?.dateTime;
      const date = created && /^\d{4}-\d{2}-\d{2}$/.test(created) ? created : created ? localDate(created) : "";
      const projectName = project ? projectNameFor(project) : "";
      const previous = next.get(id);
      if (!previous || main || (project && !previous.project)) next.set(id, {id, title, nav: root, kind: project ? "session" : "chat", project, projectName, date});
    }
    for (const link of projectLinks.filter(visible)) {
      const id = projectLinkId(link);
      const root = link.closest('nav, [role=navigation], aside, [data-testid="projects-list"]');
      const title = targetTitle(link, "project");
      if (root && title && findTrigger(link, root, "project")) {
        next.set(id, {id, title, nav: root, kind: "project"});
      }
    }
    for (const row of projectRows.filter(visible)) {
      const id = sidebarProjectId(row);
      const root = row.closest('nav, [role=navigation], aside, #app-shell-sidebar') || row.parentElement;
      const title = targetTitle(row, "project");
      if (!id || !root || !title) continue;
      const current = next.get(id);
      const trigger = findTrigger(row, root, "project");
      if (current?.node && !trigger) continue;
      next.set(id, {id, title, nav: root, kind: "project", node: row, unavailable: !trigger});
    }
    if (keepStatus && next.size === items.size && [...next].every(([id, item]) => {
      const prior = items.get(id);
      return prior && prior.nav === item.nav && prior.title === item.title && prior.project === item.project &&
        prior.projectName === item.projectName && prior.date === item.date && prior.node === item.node && prior.unavailable === item.unavailable;
    })) return;
    items = next;
    for (const id of selected) if (!items.has(id) || items.get(id).unavailable) selected.delete(id);
    const select = ui("project");
    const priorProject = select.value;
    select.replaceChildren(new Option("所有项目", ""));
    const projects = new Map(projectNames);
    for (const item of items.values()) if (item.project && !projects.has(item.project)) projects.set(item.project, item.projectName);
    for (const [id, name] of projects) select.add(new Option(name, id));
    if (activeProject !== previousActiveProject && projects.has(activeProject)) {
      select.value = activeProject;
      previousActiveProject = activeProject;
    } else {
      select.value = projects.has(priorProject) ? priorProject : "";
      if (!activeProject) previousActiveProject = "";
    }
    if (!keepStatus) ui("status").textContent = items.size ? "" : "暂时没有找到对话。请确认已登录并打开左侧历史列表。";
    renderList();
  }

  function findTrigger(link, root, kind) {
    if (kind === "project" && sidebarProjectId(link)) {
      const menus = [...link.querySelectorAll('button[aria-haspopup="menu"]')].filter((button) =>
        button.closest(projectRowSelector) === link &&
        !button.closest('li, [role="listitem"], [role="group"][aria-label]')?.querySelector('a[href*="/c/"]'));
      const preferred = menus.filter((button) => /项目操作|專案操作|project (?:actions|options)/i.test(button.getAttribute("aria-label") || ""));
      const candidates = preferred.length ? preferred : menus;
      return candidates.length === 1 ? candidates[0] : null;
    }
    return findRow(link, root, kind)?.querySelector(triggerSelector);
  }

  function findRow(link, nav, kind = "chat") {
    for (let row = link; row && row !== nav; row = row.parentElement) {
      const ids = new Set([...row.querySelectorAll("a[href]")].map((entry) => itemId(entry, kind)).filter(Boolean));
      if (row !== link && (kind === "project" ? links(row).length : [...row.querySelectorAll("a[href]")].some(projectLinkId))) break;
      if (ids.size > 1) break;
      const triggers = [...row.querySelectorAll(triggerSelector)];
      if (triggers.length === 1 && (kind !== "project" || ids.size === 1 || row === link)) return row;
      if (triggers.length > 1) break;
    }
    return null;
  }

  function dateBounds() {
    const mode = view === "project" ? "" : ui("dateMode").value;
    const from = mode === "after" || mode === "range" ? ui("from").value : "";
    const to = mode === "before" || mode === "range" ? ui("to").value : "";
    return {mode, from, to};
  }

  function updateDates() {
    const {mode, from, to} = dateBounds();
    ui("fromLabel").hidden = !["after", "range"].includes(mode);
    ui("toLabel").hidden = !["before", "range"].includes(mode);
    ui("fromText").textContent = mode === "after" ? "晚于" : "从";
    ui("toText").textContent = mode === "before" ? "早于" : "到";
    ui("dateFields").hidden = ui("clearDates").hidden = !mode;
    const hint = ui("dateHint");
    const scopedItems = [...items.values()].filter((item) => item.kind === view && (view !== "session" || !ui("project").value || item.project === ui("project").value));
    const missing = scopedItems.filter((item) => !dateFor(item)).length;
    const invalid = from && to && from > to;
    hint.hidden = !(invalid || ((from || to) && missing));
    hint.textContent = invalid ? "起始日期不能晚于结束日期。" : scopedItems.length === missing
      ? "这些对话没有创建日期。"
      : "没有创建日期的对话已隐藏。";
  }

  function filtered() {
    const query = ui("filter").value.trim().toLocaleLowerCase();
    const {mode, from, to} = dateBounds();
    const project = ui("project").value;
    return [...items.values()].filter((item) => {
      const date = dateFor(item);
      return item.kind === view && item.title.toLocaleLowerCase().includes(query) &&
        (view !== "session" || !project || item.project === project) &&
        (!(from || to) || (date &&
          (!from || (mode === "after" ? date > from : date >= from)) &&
          (!to || (mode === "before" ? date < to : date <= to))));
    });
  }

  function renderList() {
    ui("projectField").hidden = view !== "session";
    ui("dateModeField").hidden = view === "project";
    ui("filter").placeholder = view === "project" ? "搜索项目" : "搜索对话标题";
    ui("filter").setAttribute("aria-label", ui("filter").placeholder);
    updateDates();
    const matches = filtered();
    const list = ui("list");
    const empty = ui("empty");
    list.hidden = !matches.length;
    empty.hidden = !!matches.length || (!!scan && !items.size);
    empty.textContent = view === "project" ? "没有找到项目" : view === "session" && ![...items.values()].some((item) => item.kind === "session") ? "打开项目查看其中的对话" : "没有符合条件的对话";
    drag = null;
    list.replaceChildren();
    for (const [index, item] of matches.entries()) {
      const {id} = item;
      const row = document.createElement("li");
      const label = document.createElement("label");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = selected.has(id);
      check.disabled = !!item.unavailable;
      check.addEventListener("change", () => {
        if (check.checked) selected.add(id);
        else selected.delete(id);
        renderCount(matches);
      });
      const text = document.createElement("span");
      text.className = "row-text";
      text.textContent = item.title;
      const metadata = item.kind === "project" ? [item.unavailable ? "项目 · 暂无法删除" : "项目"] :
        [item.kind === "session" ? "项目内对话" : "", item.projectName, dateFor(item)].filter(Boolean);
      if (metadata.length) {
        const meta = document.createElement("span");
        meta.className = "meta";
        meta.textContent = metadata.join(" · ");
        text.append(meta);
      }
      label.append(check);
      const icon = typeIcon(item.kind);
      if (icon) label.append(icon);
      label.append(text);
      const grip = document.createElement("button");
      grip.type = "button";
      grip.className = "grip";
      grip.setAttribute("aria-label", "拖动连续选择");
      grip.title = "拖动选中多条";
      grip.textContent = "⠿";
      grip.tabIndex = -1;
      grip.disabled = !!item.unavailable;
      row.dataset.index = index;
      grip.onpointerdown = (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        grip.setPointerCapture(event.pointerId);
        drag = {pointerId: event.pointerId, start: index, original: new Set(selected), select: !selected.has(id), matches};
        selectRange(index);
      };
      row.append(grip, label);
      list.append(row);
    }
    renderCount(matches);
  }

  function typeIcon(kind) {
    if (kind !== "project" && kind !== "session") return null;
    const icon = document.createElement("span");
    icon.className = "type-icon " + kind;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function describe(item) {
    return [item.title, item.projectName, dateFor(item)].filter(Boolean).join(" · ");
  }

  function selectRange(end) {
    const first = Math.min(drag.start, end);
    const last = Math.max(drag.start, end);
    drag.matches.forEach(({id, unavailable}, index) => {
      if (unavailable) return;
      const checked = index >= first && index <= last ? drag.select : drag.original.has(id);
      if (checked) selected.add(id);
      else selected.delete(id);
      ui("list").children[index].querySelector("input").checked = checked;
    });
    renderCount(drag.matches);
  }

  ui("list").onpointermove = (event) => {
    if (drag?.pointerId !== event.pointerId) return;
    const list = ui("list");
    const bounds = list.getBoundingClientRect();
    if (event.clientY < bounds.top + 20) list.scrollTop -= 20;
    if (event.clientY > bounds.bottom - 20) list.scrollTop += 20;
    const y = Math.max(bounds.top, Math.min(bounds.bottom - 1, event.clientY));
    const row = [...list.children].find((entry) => {
      const rect = entry.getBoundingClientRect();
      return y >= rect.top && y < rect.bottom;
    });
    if (row) selectRange(Number(row.dataset.index));
  };
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    ui("list").addEventListener(type, (event) => {
      if (drag?.pointerId === event.pointerId) drag = null;
    });
  }

  function renderCount(matches) {
    const hiddenCount = selected.size - matches.filter(({id}) => selected.has(id)).length;
    const total = [...items.values()].filter((item) => item.kind === view).length;
    const unit = view === "project" ? " 个项目" : " 条对话";
    ui("count").textContent = (matches.length === total ? total : matches.length + " / " + total) + unit;
    ui("selection").textContent = selected.size ? "已选 " + selected.size + " 条" +
      (hiddenCount ? "（" + hiddenCount + " 条不在当前结果）" : "") : "";
    ui("preview").disabled = !selected.size;
    ui("preview").textContent = view === "project" ? (selected.size ? "删除 " + selected.size + " 个项目" : "删除项目") : (selected.size ? "批量删除（" + selected.size + " 条）" : "批量删除");
    const selectable = matches.filter((item) => !item.unavailable);
    const allSelected = selectable.length > 0 && selectable.every(({id}) => selected.has(id));
    ui("all").textContent = allSelected ? "取消全选" : "全选";
    ui("all").disabled = !selectable.length;
    ui("clear").hidden = !selected.size;
  }

  function visibleMatches(selector, root = document) {
    return [...root.querySelectorAll(selector)].filter(visible);
  }

  function isDeleteLabel(value, labels) {
    return labels.has((value || "").replace(/\s+/g, " ").trim().replace(/[.…:：!?！？]+$/, "").trim().toLocaleLowerCase());
  }

  function onlyDelete(root, selector, kind = "chat", confirmation = false, isProjectDialog = false) {
    const labels = kind !== "project" ? deleteLabels : !confirmation ? deleteLabels : projectDeleteLabels;
    const allowedLabels = kind === "project" && confirmation && isProjectDialog ? projectConfirmationLabels :
      kind === "project" && !confirmation ? new Set([...projectDeleteLabels, "delete", "删除", "刪除"]) : labels;
    const actions = visibleMatches(selector, root).filter((node) => {
      if (node.closest(':disabled, [aria-disabled="true"]')) return false;
      const testId = node.getAttribute("data-testid") || "";
      if (kind === "project" && /^(?:delete-project(?:-button|-menu-item)?|project-delete(?:-button)?)$/i.test(testId)) return true;
      if (kind !== "project" && /^(?:delete-(?:chat|conversation)(?:-menu-item|-button)?|(?:chat|conversation|history-item)-delete(?:-button)?)$/i.test(testId)) return true;
      const labelledBy = (node.getAttribute("aria-labelledby") || "").split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent || "").join(" ");
      if (isDeleteLabel(node.getAttribute("aria-label"), allowedLabels) || isDeleteLabel(labelledBy, allowedLabels) ||
          isDeleteLabel(node.innerText, allowedLabels) || isDeleteLabel(node.textContent, allowedLabels)) return true;
      // Shortcut hints and screen-reader text can make the full label longer.
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      for (let part = walker.nextNode(); part; part = walker.nextNode()) {
        if (isDeleteLabel(part.nodeValue, allowedLabels) && visible(part.parentElement)) return true;
      }
      return false;
    });
    const outermost = actions.filter((node) => !actions.some((other) => other !== node && other.contains(node)));
    return outermost.length === 1 ? outermost[0] : null;
  }

  function projectMenu(trigger) {
    const controlled = trigger.getAttribute("aria-controls");
    const commandTarget = trigger.getAttribute("commandfor") || trigger.getAttribute("popovertarget");
    if (!controlled && !commandTarget) return null;
    for (const id of [controlled, commandTarget].filter(Boolean)) {
      const container = document.getElementById(id);
      if (container && visible(container)) return container;
    }
    return null;
  }

  function identifiesProject(dialog, title) {
    const heading = dialog.querySelector("h1, h2, h3, [role=heading]")?.textContent || "";
    if (/^(?:要)?从聊天和工作中删除此项目(?:吗)?[？?]?$/i.test(heading.trim())) return true;
    if (/(?:delete (?:this )?project|删除(?:此|该|這個|此個)?项目|刪除(?:此|該|這個)?(?:專案|項目))/i.test(heading)) return true;
    const quoted = [...heading.matchAll(/["“「『]([^"”」』]+)["”」』]/g)];
    if (/(?:delete|删除|刪除)/i.test(heading) && quoted.some((match) => match[1].trim() === title)) return true;
    return /(?:this project|该项目|此项目|此專案|這個專案|此項目)/i.test(dialog.textContent) &&
      /(?:delete|删除|刪除)/i.test(heading);
  }

  function expectedRedirect(item, initialUrl) {
    const before = new URL(initialUrl);
    const current = new URL(location.href);
    if (before.origin !== current.origin) return false;
    if (item.kind === "project") return (projectId(before.pathname) || projectLinkId({href: before.href})) === item.id && current.pathname === "/";
    if (chatId({href: before.href}) !== item.id) return false;
    if (current.pathname === "/") return true;
    const project = projectId(before.pathname);
    return !!project && projectId(current.pathname) === project && /\/project\/?$/.test(current.pathname);
  }

  function samePage() {
    return location.href === pageUrl && sourceNav?.isConnected && rendered(sourceNav);
  }

  function assertReady() {
    if (stopped) throw new Error("已停止删除");
    if (!samePage()) throw new Error("页面或侧栏已变化");
  }

  async function waitFor(check, message, {settling = false} = {}) {
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      if (!settling) assertReady();
      const value = check();
      if (value) return value;
      await new Promise((resolve) => setTimeout(resolve, 70));
    }
    throw new Error(typeof message === "function" ? message() : message);
  }

  async function remove(item) {
    assertReady();
    const candidates = matchingTargets(sourceNav, item).filter(visible);
    const link = candidates.includes(item.node) ? item.node : candidates.length === 1 ? candidates[0] : null;
    const currentProject = item.kind !== "project" && link && (projectId(new URL(link.href).pathname) || projectScope(link, sourceNav) ||
      (sourceNav.matches("main, [role=main]") ? projectId(location.pathname) : ""));
    if (link && item.kind !== "project" && currentProject !== item.project) throw new Error("对话归属已变化，请重新加载对话。");
    const trigger = link && findTrigger(link, sourceNav, item.kind);
    const object = item.kind === "project" ? "项目" : "对话";
    if (!trigger || targetTitle(link, item.kind) !== item.title) throw new Error("无法定位待删除的" + object);
    if (visibleMatches(menuSelector).length || visibleMatches(dialogSelector).length) throw new Error("网页仍有菜单或弹窗打开");
    link.scrollIntoView?.({block: "nearest", inline: "nearest"});
    // Menu triggers may open on pointerdown and cancel the ensuing click.
    const pointer = new PointerEvent("pointerdown", {bubbles: true, cancelable: true, button: 0, pointerType: "mouse"});
    const usesNativePopover = trigger.hasAttribute("commandfor") || trigger.hasAttribute("popovertarget");
    if (usesNativePopover || (trigger.dispatchEvent(pointer) && trigger.getAttribute("aria-expanded") !== "true")) trigger.click();
    let foundMenu = false;
    const action = await waitFor(() => {
      const owned = item.kind === "project" && projectMenu(trigger);
      if (owned) {
        foundMenu = true;
        return onlyDelete(owned, '[role="menuitem"], button, [role="button"], [data-testid]', "project");
      }
      const menus = visibleMatches(menuSelector);
      if (menus.length !== 1) return null;
      const candidate = menus[0];
      const controlled = trigger.getAttribute("aria-controls");
      const labelled = candidate.getAttribute("aria-labelledby");
      if ((controlled && candidate.id !== controlled) || (labelled && !labelled.split(/\s+/).includes(trigger.id))) return null;
      foundMenu = true;
      return onlyDelete(candidate, '[role="menuitem"], [role="menuitemcheckbox"], button, [role="button"], [data-testid]', item.kind);
    }, () => foundMenu ? "在" + object + "菜单中找不到「删除」" : "未打开" + object + "菜单");
    assertReady();
    action.click();
    const confirm = await waitFor(() => {
      const dialogs = visibleMatches(dialogSelector);
      if (dialogs.length !== 1) return null;
      const dialog = dialogs[0];
      const isProjectDialog = identifiesProject(dialog, item.kind === "project" ? item.title : "");
      if (isProjectDialog && item.kind !== "project") return null;
      const button = onlyDelete(dialog, 'button, [role="button"]', item.kind, true, isProjectDialog);
      return button && {dialog: dialogs[0], button};
    }, "无法识别" + object + "的删除确认按钮");
    assertReady();
    const initialUrl = pageUrl;
    item.submitted = true;
    confirm.button.click();
    await waitFor(() => {
      const routeIsExpected = location.href === initialUrl || expectedRedirect(item, initialUrl);
      if (!routeIsExpected || visible(confirm.dialog)) return false;
      if (item.kind === "project" && !matchingTargets(document, item).some(visible) &&
          !batch.slice(batch.indexOf(item) + 1).some((entry) => entry.nav === sourceNav)) return true;
      if (location.href !== initialUrl && sourceNav.matches("main, [role=main]") &&
          !/\/project\/?$/.test(location.pathname)) return false;
      if (!sourceNav.isConnected || !rendered(sourceNav)) {
        const remaining = batch.slice(batch.indexOf(item) + 1).filter((entry) => entry.nav === sourceNav);
        if (!remaining.length) return false;
        const roots = visibleMatches(sourceNav.matches("main, [role=main]") ? "main, [role=main]" : "nav, [role=navigation], aside");
        const replacements = roots.filter((root) => remaining.every((entry) =>
          matchingTargets(root, entry).filter((candidate) => visible(candidate) &&
            targetTitle(candidate, entry.kind) === entry.title && findTrigger(candidate, root, entry.kind)).length === 1));
        if (replacements.length !== 1) return false;
        for (const entry of remaining) entry.nav = replacements[0];
        sourceNav = replacements[0];
      }
      return item.kind === "project" ? !matchingTargets(document, item).some(visible) : !matchingTargets(sourceNav, item).length;
    }, "请在左侧列表确认" + object + "是否已删除", {settling: true});
    pageUrl = location.href;
  }

  function pauseOnInteraction(event) {
    if (event.isTrusted && !event.composedPath().includes(host)) {
      stopped = true;
      ui("status").textContent = "检测到你在操作网页，正在停止删除。";
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function historyScroller() {
    for (const link of visibleMatches('nav a[href], [role=navigation] a[href]').filter(chatId)) {
      for (let node = link.parentElement; node && node !== document.body; node = node.parentElement) {
        if (node.scrollHeight > node.clientHeight + 2 && /^(auto|scroll|overlay)$/.test(getComputedStyle(node).overflowY)) return node;
      }
    }
    return null;
  }

  function stopScan(message) {
    if (!scan) return;
    clearTimeout(scan.timer);
    if (scan.scroller?.isConnected) scan.scroller.scrollTop = scan.originalTop;
    scan = null;
    ui("stopScan").hidden = true;
    ui("scanStatus").textContent = message;
    if (!items.size) ui("empty").hidden = !!message;
  }

  function startScan() {
    if (running || !ui("review").hidden) return;
    stopScan("");
    const job = {url: location.href, started: Date.now(), stable: 0, previous: ""};
    scan = job;
    ui("stopScan").hidden = false;
    function step() {
      if (scan !== job) return;
      if (host.hidden || job.url !== location.href || !ui("review").hidden) {
        stopScan("已停止加载对话。");
        return;
      }
      if (drag) {
        job.timer = setTimeout(step, 450);
        return;
      }
      read({keepStatus: true});
      const scroller = historyScroller();
      if (scroller && scroller !== job.scroller) {
        if (job.scroller?.isConnected) job.scroller.scrollTop = job.originalTop;
        job.scroller = scroller;
        job.originalTop = scroller.scrollTop;
        job.stable = 0;
      }
      const before = scroller?.scrollTop ?? 0;
      if (scroller) scroller.scrollTop += Math.max(scroller.clientHeight - 50, 100);
      const signature = [items.size, scroller?.scrollHeight, scroller?.scrollTop].join("/");
      job.stable = signature === job.previous && before === (scroller?.scrollTop ?? 0) ? job.stable + 1 : 0;
      job.previous = signature;
      ui("scanStatus").textContent = "正在加载…";
      if (job.stable >= 5 || Date.now() - job.started > 120000) {
        stopScan(items.size ? "" : "未找到对话，请打开左侧历史列表。");
      } else {
        job.timer = setTimeout(step, 450);
      }
    }
    step();
  }

  let observedUrl = location.href;
  const observer = new MutationObserver((mutations) => {
    if (host.hidden || running || !ui("review").hidden) return;
    if (location.href !== observedUrl) {
      observedUrl = location.href;
      startScan();
      return;
    }
    if (scan || !mutations.some(({target}) => target instanceof Element &&
        target.closest("nav, [role=navigation], main, [role=main]"))) return;
    clearTimeout(readTimer);
    readTimer = setTimeout(() => {
      if (!host.hidden && !drag && !scan && ui("review").hidden) read({keepStatus: true});
    }, 250);
  });
  observer.observe(document.body, {childList: true, subtree: true});
  host.addEventListener("bulk-history-open", startScan);

  ui("close").onclick = () => {
    if (running) return;
    stopScan("");
    host.hidden = true;
  };
  ui("refresh").onclick = startScan;
  ui("stopScan").onclick = () => stopScan("已停止加载对话。");
  ui("filter").oninput = renderList;
  for (const id of ["dateMode", "from", "to", "project"]) ui(id).onchange = renderList;
  ui("clearDates").onclick = () => {
    for (const id of ["dateMode", "from", "to"]) ui(id).value = "";
    renderList();
  };
  function updateCachedDate(key, value) {
    if (!key.startsWith("created:")) return;
    const id = key.slice("created:".length);
    if (typeof value === "number") savedDates.set(id, value);
    else savedDates.delete(id);
  }
  if (storage) {
    storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      for (const [key, {newValue}] of Object.entries(changes)) updateCachedDate(key, newValue);
      if (!drag && ui("review").hidden) renderList();
    });
    storage.local.get(null).then((records) => {
      for (const [key, value] of Object.entries(records)) {
        if (!savedDates.has(key.slice("created:".length))) updateCachedDate(key, value);
      }
      if (!drag && ui("review").hidden) renderList();
    }).catch(() => {});
  }

  for (const button of shadow.querySelectorAll("[data-mode]")) {
    button.onclick = () => {
      if (view === button.dataset.mode) return;
      view = button.dataset.mode;
      selected.clear();
      for (const option of shadow.querySelectorAll("[data-mode]")) {
        option.setAttribute("aria-pressed", String(option === button));
      }
      ui("status").textContent = "";
      renderList();
    };
  }
  ui("all").onclick = () => {
    const matches = filtered().filter((item) => !item.unavailable);
    const allSelected = matches.every(({id}) => selected.has(id));
    for (const {id} of matches) {
      if (allSelected) selected.delete(id);
      else selected.add(id);
    }
    renderList();
  };
  ui("clear").onclick = () => { selected.clear(); renderList(); };
  ui("preview").onclick = () => {
    stopScan("");
    batch = [...selected].map((id) => items.get(id)).filter((item) => item && !item.unavailable);
    if (!batch.length) return;
    if (batch.some(({nav}) => !nav.isConnected)) {
      ui("status").textContent = "对话列表已变化。请重新加载对话后再试。";
      return;
    }
    pageUrl = location.href;
    const queue = ui("queue");
    queue.replaceChildren();
    for (const item of batch) {
      const row = document.createElement("li");
      const icon = typeIcon(item.kind);
      const text = document.createElement("span");
      text.className = "row-text";
      text.textContent = describe(item);
      if (icon) row.append(icon);
      row.append(text);
      queue.append(row);
      item.result = text;
    }
    const unit = view === "project" ? " 个项目" : " 条对话";
    ui("summary").textContent = "确认删除 " + batch.length + unit + "？";
    ui("warning").textContent = view === "project" ? "项目中的对话、指令和仅存于项目中的文件也会被删除。" : "删除后无法恢复。";
    ui("run").textContent = "确认删除 " + batch.length + (view === "project" ? " 个项目" : " 条");
    ui("status").textContent = "";
    ui("run").disabled = false;
    ui("review").hidden = false;
    ui("refresh").hidden = true;
    ui("pick").hidden = true;
    ui("back").focus();
  };
  ui("back").onclick = () => {
    ui("review").hidden = true;
    ui("refresh").hidden = false;
    ui("pick").hidden = false;
    read();
  };
  ui("stop").onclick = () => {
    stopped = true;
    ui("stop").disabled = true;
    ui("status").textContent = "正在停止，已提交的删除可能仍会完成。";
  };
  ui("run").onclick = async () => {
    if (running) return;
    running = true;
    stopped = false;
    ui("run").disabled = true;
    ui("close").disabled = true;
    ui("back").disabled = true;
    ui("stop").hidden = false;
    ui("stop").disabled = false;
    let deleted = 0;
    let attempted = 0;
    let reason = "";
    let submitted = false;
    const events = ["pointerdown", "click", "keydown"];
    for (const type of events) document.addEventListener(type, pauseOnInteraction, true);
    try {
      for (const item of batch) {
        sourceNav = item.nav;
        if (stopped || !samePage()) {
          reason = stopped ? "已停止删除" : "页面或侧栏已变化";
          break;
        }
        attempted++;
        ui("status").textContent = `正在删除第 ${attempted} / ${batch.length} 条。`;
        try {
          await remove(item);
          selected.delete(item.id);
          deleted++;
          item.result.textContent = `已删除 · ${item.title}`;
        } catch (error) {
          reason = error.message;
          submitted = !!item.submitted;
          item.result.textContent = (submitted ? "未确认结果 · " : "未提交删除 · ") + item.title;
          break;
        }
      }
    } finally {
      for (const type of events) document.removeEventListener(type, pauseOnInteraction, true);
      for (const item of batch.slice(attempted)) item.result.textContent = `待处理 · ${item.title}`;
      running = false;
      ui("stop").hidden = true;
      ui("back").disabled = false;
      ui("close").disabled = false;
      ui("status").textContent = `已删除 ${deleted} 条 · 未确认 ${submitted ? 1 : 0} 条 · 未提交 ${attempted - deleted - Number(submitted)} 条 · 待处理 ${batch.length - attempted} 条。${reason ? `${reason}。` : ""}`;
    }
  };

  startScan();
  ui("filter").focus();
})();
