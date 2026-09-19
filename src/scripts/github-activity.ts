import type { PortfolioContent } from "../data/portfolio";
import { GITHUB_SNAPSHOT_URL, validateGitHubSnapshot, type GitHubSnapshot, type PRScope } from "../lib/github";
import { initGitHubCalendar } from "./github-calendar";
import { onPageLoad } from "./page-lifecycle";

onPageLoad((signal) => {

const root = document.querySelector<HTMLElement>("[data-github-activity]");

if (root) {
  const copy: PortfolioContent["openSource"]["github"] = JSON.parse(root.querySelector("[data-github-copy]")!.textContent!);
  let snapshot = validateGitHubSnapshot(JSON.parse(root.querySelector("[data-github-snapshot]")!.textContent!));
  const calendar = initGitHubCalendar(root.querySelector<HTMLElement>("[data-github-calendar]")!);
  const locale = root.dataset.locale!;
  const dateFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const syncFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  const list = root.querySelector<HTMLUListElement>("[data-github-pr-list]")!;
  const template = root.querySelector<HTMLTemplateElement>("[data-github-pr-template]")!;
  const empty = root.querySelector<HTMLElement>("[data-github-pr-empty]")!;
  const description = root.querySelector<HTMLElement>("[data-github-scope-description]")!;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-github-scope]")];
  const refresh = root.querySelector<HTMLButtonElement>("[data-github-refresh]")!;
  const status = root.querySelector<HTMLElement>("[data-github-sync-status]")!;
  const cacheKey = "portfolio.github.carabistouflette.v1";
  const cacheLifetime = 60 * 60 * 1000;
  let scope: PRScope = "recent";
  const preview = root.hasAttribute("data-github-preview");
  let pending = false;

  const setStatus = (message: string): void => {
    const stale = Date.now() - Date.parse(snapshot.updatedAt) > 36 * cacheLifetime;
    status.textContent = [message, stale ? copy.staleLabel : ""].filter(Boolean).join(" ");
  };

  const renderRequests = (): void => {
    if (preview) return;
    const previousLink = document.activeElement instanceof HTMLAnchorElement && list.contains(document.activeElement)
      ? document.activeElement.getAttribute("href") : null;
    const rows = snapshot.pullRequests[scope].map((request) => {
      const row = template.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
      const repository = row.querySelector<HTMLAnchorElement>("[data-pr-repository]")!;
      repository.textContent = request.repository;
      repository.href = `https://github.com/${request.repository}`;
      row.querySelector("[data-pr-number]")!.textContent = `#${request.number}`;
      const state = row.querySelector<HTMLElement>("[data-pr-state]")!;
      state.dataset.prState = request.state;
      state.textContent = copy.states[request.state];
      row.querySelector("[data-pr-relationship]")!.textContent = copy.relationships[request.relationship];
      const title = row.querySelector<HTMLAnchorElement>("[data-pr-title]")!;
      title.textContent = request.title;
      title.href = request.url;
      const created = row.querySelector<HTMLTimeElement>("[data-pr-created]")!;
      created.dateTime = request.createdAt;
      created.textContent = dateFormat.format(new Date(request.createdAt));
      const eventDate = request.mergedAt ?? request.updatedAt;
      const event = row.querySelector<HTMLTimeElement>("[data-pr-event]")!;
      event.dateTime = eventDate;
      event.textContent = dateFormat.format(new Date(eventDate));
      row.querySelector("[data-pr-event-label]")!.textContent = request.mergedAt ? copy.mergedLabel : copy.updatedLabel;
      row.querySelector<HTMLAnchorElement>("[data-pr-discussion]")!.href = request.url;
      row.querySelector<HTMLAnchorElement>("[data-pr-files]")!.href = `${request.url}/files`;
      row.querySelector<HTMLAnchorElement>("[data-pr-commits]")!.href = `${request.url}/commits`;
      return row;
    });
    list.replaceChildren(...rows);
    empty.hidden = rows.length > 0;
    description.textContent = copy.scopes[scope].description;
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.githubScope === scope));
    if (previousLink) {
      const replacement = [...list.querySelectorAll<HTMLAnchorElement>("a")].find((link) => link.getAttribute("href") === previousLink);
      (replacement ?? buttons.find((button) => button.dataset.githubScope === scope))?.focus({ preventScroll: true });
    }
  };

  const applySnapshot = (next: GitHubSnapshot): void => {
    // Never replace newer build data with an older CDN or browser snapshot.
    if (Date.parse(next.updatedAt) <= Date.parse(snapshot.updatedAt)) return;
    snapshot = next;
    renderRequests();
    if (!preview) {
      root.querySelector("[data-github-open]")!.textContent = String(snapshot.counts.open);
      root.querySelector("[data-github-merged]")!.textContent = String(snapshot.counts.merged);
    }
    const time = root.querySelector<HTMLTimeElement>("[data-github-updated]")!;
    time.dateTime = snapshot.updatedAt;
    time.textContent = `${syncFormat.format(new Date(snapshot.updatedAt))} UTC`;
    calendar.update(snapshot.calendar);
  };

  const synchronize = async (): Promise<void> => {
    if (pending) return;
    pending = true;
    refresh.disabled = true;
    setStatus(copy.refreshingLabel);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(GITHUB_SNAPSHOT_URL, { signal: AbortSignal.any([controller.signal, signal]), credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" });
      if (!response.ok) throw new Error(`GitHub snapshot: HTTP ${response.status}`);
      const next = validateGitHubSnapshot(await response.json());
      if (signal.aborted) return;
      applySnapshot(next);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ checkedAt: Date.now(), snapshot }));
      } catch {
        // Storage is optional: private browsing must not disable live updates.
      }
      setStatus(copy.refreshedLabel);
    } catch {
      if (signal.aborted) return;
      setStatus(copy.updateFailedLabel);
    } finally {
      window.clearTimeout(timeout);
      refresh.disabled = false;
      pending = false;
    }
  };

  for (const button of buttons) button.addEventListener("click", () => {
    scope = button.dataset.githubScope as PRScope;
    renderRequests();
  });
  refresh.addEventListener("click", () => { void synchronize(); });
  if (!preview) root.querySelector<HTMLElement>("[data-github-scopes]")!.hidden = false;
  refresh.hidden = false;

  let recentlyChecked = false;
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const cached = JSON.parse(stored);
      const cachedSnapshot = validateGitHubSnapshot(cached.snapshot);
      applySnapshot(cachedSnapshot);
      const age = Date.now() - cached.checkedAt;
      recentlyChecked = typeof cached.checkedAt === "number" && age >= 0 && age < cacheLifetime;
      setStatus(copy.cachedLabel);
    }
  } catch {
    // Invalid or blocked storage is ignored; the validated build snapshot remains.
  }
  if (!recentlyChecked) void synchronize();
}
});
