import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parseGitHubCalendarHtml } from "./github-calendar-parser.mjs";

const LOGIN = "carabistouflette";
const REPOSITORY_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SNAPSHOT_PATH = resolve(REPOSITORY_ROOT, "src/data/github.json");
const GITHUB_API = "https://api.github.com/search/issues";
const GITHUB_CALENDAR = "https://github.com/users/carabistouflette/contributions";
const AUTHOR_QUERY = "author:carabistouflette is:pr is:public";
const FEATURED_REPOSITORY = "brio-labs/maestria";
const FEATURED_PULL_NUMBERS = [485, 501, 511];
const REQUEST_TIMEOUT_MS = 20_000;

function requestHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "Accept-Language": "en",
    "User-Agent": "alexis-robin-portfolio-github-sync",
  };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: requestHeaders(),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`GitHub request failed (${response.status}) for ${new URL(url).pathname}`);
    }
    return await response.text();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`GitHub request timed out for ${new URL(url).pathname}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  const text = await fetchText(url);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`GitHub returned malformed JSON for ${new URL(url).pathname}`);
  }
}

function assertRecord(value, message) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(message);
  }
  return value;
}

function assertDateTime(value, field) {
  const normalized = typeof value === "string" && value.endsWith("Z") && !value.includes(".")
    ? `${value.slice(0, -1)}.000Z`
    : value;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== normalized
  ) {
    throw new Error(`GitHub ${field} is malformed`);
  }
  return value;
}

function parseRepository(item) {
  if (typeof item.repository_url !== "string") {
    throw new Error("GitHub search item is missing repository_url");
  }
  const match = /^https:\/\/api\.github\.com\/repos\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(
    item.repository_url,
  );
  if (!match) {
    throw new Error("GitHub search item has an unexpected repository URL");
  }
  return `${match[1]}/${match[2]}`;
}

export function toPullRequest(item) {
  assertRecord(item, "GitHub search item is malformed");
  const user = assertRecord(item.user, "GitHub search item is missing user");
  if (typeof user.login !== "string" || user.login.toLowerCase() !== LOGIN) {
    throw new Error("GitHub search item author does not match the configured login");
  }
  if (
    !Number.isSafeInteger(item.number) ||
    item.number < 1 ||
    item.number > 1_000_000_000 ||
    typeof item.title !== "string" ||
    item.title.length < 1 ||
    item.title.length > 500 ||
    /[\u0000-\u001f\u007f]/.test(item.title) ||
    typeof item.html_url !== "string" ||
    typeof item.created_at !== "string" ||
    typeof item.updated_at !== "string" ||
    (item.state !== "open" && item.state !== "closed") ||
    typeof item.draft !== "boolean"
  ) {
    throw new Error("GitHub search item has malformed pull-request fields");
  }

  const repository = parseRepository(item);
  const expectedUrl = `https://github.com/${repository}/pull/${item.number}`;
  if (item.html_url !== expectedUrl) {
    throw new Error("GitHub search item has an unexpected pull-request URL");
  }
  const createdAt = assertDateTime(item.created_at, "created_at");
  const updatedAt = assertDateTime(item.updated_at, "updated_at");
  if (Date.parse(createdAt) > Date.parse(updatedAt)) {
    throw new Error("GitHub pull-request dates are not chronological");
  }

  const pullRequest = assertRecord(item.pull_request, "GitHub search item is missing pull_request");
  if (pullRequest.merged_at !== null && typeof pullRequest.merged_at !== "string") {
    throw new Error("GitHub pull-request merged_at is malformed");
  }
  const mergedAt =
    pullRequest.merged_at === null ? null : assertDateTime(pullRequest.merged_at, "merged_at");
  if (mergedAt !== null && (Date.parse(createdAt) > Date.parse(mergedAt) || Date.parse(mergedAt) > Date.parse(updatedAt))) {
    throw new Error("GitHub pull-request merge date is not chronological");
  }

  const owner = repository.slice(0, repository.indexOf("/"));
  const relationship =
    owner.toLowerCase() === LOGIN
      ? "personal"
      : item.author_association === "MEMBER" || item.author_association === "OWNER"
        ? "organization"
        : "external";
  const state = mergedAt !== null ? "merged" : item.draft ? "draft" : item.state;

  return {
    repository,
    number: item.number,
    title: item.title,
    url: item.html_url,
    createdAt,
    updatedAt,
    mergedAt,
    state,
    relationship,
  };
}

function parseSearchResponse(value, label, pageSize) {
  assertRecord(value, `GitHub ${label} response is malformed`);
  if (
    !Number.isSafeInteger(value.total_count) ||
    value.total_count < 0 ||
    value.total_count > 2_000_000_000 ||
    value.incomplete_results !== false ||
    !Array.isArray(value.items) ||
    value.items.length !== Math.min(value.total_count, pageSize)
  ) {
    throw new Error(`GitHub ${label} response is incomplete or malformed`);
  }
  return {
    totalCount: value.total_count,
    items: value.items.map(toPullRequest),
  };
}

function searchUrl(query, sort, pageSize) {
  const url = new URL(GITHUB_API);
  url.searchParams.set("q", query);
  url.searchParams.set("per_page", String(pageSize));
  if (sort) {
    url.searchParams.set("sort", sort);
    url.searchParams.set("order", "desc");
  }
  return url.href;
}

async function fetchSearch(query, sort, label, pageSize) {
  const response = await fetchJson(searchUrl(query, sort, pageSize));
  return parseSearchResponse(response, label, pageSize);
}

async function fetchCalendar() {
  const html = await fetchText(GITHUB_CALENDAR);
  return parseGitHubCalendarHtml(html);
}

function buildSnapshot(recent, external, open, merged, featuredPool, calendar) {
  if (open.totalCount > 0 && open.items.length === 0) {
    throw new Error("GitHub open search returned a total without any records");
  }
  if (merged.totalCount > 0 && merged.items.length === 0) {
    throw new Error("GitHub merged search returned a total without any records");
  }
  if (open.items.some((item) => item.state !== "open" && item.state !== "draft")) {
    throw new Error("GitHub open search returned a non-open pull request");
  }
  if (merged.items.some((item) => item.state !== "merged")) {
    throw new Error("GitHub merged search returned a non-merged pull request");
  }

  const byNumber = new Map(featuredPool.items.map((item) => [item.number, item]));
  const featured = FEATURED_PULL_NUMBERS.map((number) => {
    const record = byNumber.get(number);
    if (!record) {
      throw new Error(`GitHub featured pull request #${number} is missing from the ${FEATURED_REPOSITORY} search`);
    }
    return record;
  });

  return {
    version: 1,
    login: LOGIN,
    updatedAt: new Date().toISOString(),
    pullRequests: {
      recent: recent.items,
      external: external.items,
      open: open.items,
    },
    counts: {
      open: open.totalCount,
      merged: merged.totalCount,
    },
    featured,
    calendar,
  };
}

async function writeSnapshot(snapshot) {
  const temporaryPath = `${SNAPSHOT_PATH}.tmp-${process.pid}`;
  await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  await rename(temporaryPath, SNAPSHOT_PATH);
}

async function readExistingSnapshot() {
  try {
    const text = await readFile(SNAPSHOT_PATH, "utf8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function importValidator() {
  const moduleUrl = new URL("../src/lib/github.ts", import.meta.url);
  return import(moduleUrl.href);
}
function startConcurrent(task, index) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      task().then(resolve, reject);
    }, index * 300);
  });
}


export async function syncGitHubSnapshot() {
  const jobs = [
    () => fetchSearch(AUTHOR_QUERY, "created", "recent", 3),
    () => fetchSearch(`${AUTHOR_QUERY} -user:carabistouflette`, "created", "external", 3),
    () => fetchSearch(`${AUTHOR_QUERY} is:open`, "updated", "open", 3),
    () => fetchSearch(`${AUTHOR_QUERY} is:merged`, null, "merged", 1),
    () => fetchSearch(`${AUTHOR_QUERY} repo:${FEATURED_REPOSITORY}`, "created", "featured", 30),
    () => fetchCalendar(),
  ];
  const [recent, external, open, merged, featuredPool, calendar] = await Promise.all(
    jobs.map((job, index) => startConcurrent(job, index)),
  );
  const snapshot = buildSnapshot(recent, external, open, merged, featuredPool, calendar);
  const { validateGitHubSnapshot } = await importValidator();
  validateGitHubSnapshot(snapshot);
  await writeSnapshot(snapshot);
  return snapshot;
}

async function main() {
  const argumentsList = process.argv.slice(2);
  const allowStale = argumentsList.length === 1 && argumentsList[0] === "--allow-stale";
  if (argumentsList.length > 1 || (argumentsList.length === 1 && !allowStale)) {
    throw new Error("Usage: node scripts/sync-github.mjs [--allow-stale]");
  }

  try {
    const snapshot = await syncGitHubSnapshot();
    console.log(
      `GitHub snapshot updated (${snapshot.calendar.from}..${snapshot.calendar.to}; ${snapshot.counts.open} open, ${snapshot.counts.merged} merged).`,
    );
  } catch (error) {
    if (!allowStale) {
      throw error;
    }

    const existing = await readExistingSnapshot();
    if (existing === null) {
      throw new Error(`GitHub sync failed and no existing snapshot is available: ${error.message}`);
    }
    const { validateGitHubSnapshot } = await importValidator();
    try {
      validateGitHubSnapshot(existing);
    } catch {
      throw new Error(`GitHub sync failed and the existing snapshot is invalid: ${error.message}`);
    }
    console.warn(`GitHub sync failed; retaining the validated existing snapshot: ${error.message}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`GitHub sync failed: ${error.message}`);
    process.exitCode = 1;
  });
}
