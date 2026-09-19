export type PRScope = "recent" | "external" | "open";

export interface GitHubPullRequest {
  repository: string;
  number: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  state: "open" | "merged" | "closed" | "draft";
  relationship: "personal" | "organization" | "external";
}

export interface GitHubDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubSnapshot {
  version: 1;
  login: "carabistouflette";
  updatedAt: string;
  pullRequests: Record<PRScope, GitHubPullRequest[]>;
  counts: {
    open: number;
    merged: number;
  };
  featured?: GitHubPullRequest[];
  calendar: {
    from: string;
    to: string;
    days: GitHubDay[];
  };
}

export const GITHUB_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/carabistouflette/portfolio/main/src/data/github.json";
export const GITHUB_PROFILE_URL = "https://github.com/carabistouflette";

const LOGIN = "carabistouflette";
const PR_SCOPES: readonly PRScope[] = ["recent", "external", "open"];
const MAX_CALENDAR_DAYS = 450;
const MAX_TITLE_LENGTH = 500;
const MAX_REPOSITORY_LENGTH = 200;
const MAX_COUNT = 10_000;
const MAX_TOTAL_COUNT = 2_000_000_000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function parseDateOnly(value: unknown): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = DATE_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    !Number.isFinite(timestamp) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

function parseDateTime(value: unknown): number | null {
  if (typeof value !== "string" || !DATE_TIME_PATTERN.test(value)) {
    return null;
  }

  const timestamp = Date.parse(value);
  const normalized = value.endsWith("Z") && !value.includes(".") ? `${value.slice(0, -1)}.000Z` : value;
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== normalized) {
    return null;
  }

  return timestamp;
}

function validateRepository(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 2 &&
    value.length <= MAX_REPOSITORY_LENGTH &&
    REPOSITORY_PATTERN.test(value)
  );
}

function validatePullRequest(value: unknown): value is GitHubPullRequest {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "repository",
      "number",
      "title",
      "url",
      "createdAt",
      "updatedAt",
      "mergedAt",
      "state",
      "relationship",
    ]) ||
    !validateRepository(value.repository) ||
    typeof value.number !== "number" ||
    !Number.isSafeInteger(value.number) ||
    value.number < 1 ||
    value.number > 1_000_000_000 ||
    typeof value.title !== "string" ||
    value.title.length < 1 ||
    value.title.length > MAX_TITLE_LENGTH ||
    /[\u0000-\u001f\u007f]/.test(value.title) ||
    typeof value.url !== "string" ||
    value.url.length > 500 ||
    typeof value.createdAt !== "string" ||
    parseDateTime(value.createdAt) === null ||
    typeof value.updatedAt !== "string" ||
    parseDateTime(value.updatedAt) === null ||
    (value.mergedAt !== null &&
      (typeof value.mergedAt !== "string" || parseDateTime(value.mergedAt) === null)) ||
    !["open", "merged", "closed", "draft"].includes(value.state as string) ||
    !["personal", "organization", "external"].includes(value.relationship as string)
  ) {
    return false;
  }

  const repositoryOwner = value.repository.slice(0, value.repository.indexOf("/"));
  const expectedUrl = `https://github.com/${value.repository}/pull/${value.number}`;
  const createdAt = parseDateTime(value.createdAt);
  const updatedAt = parseDateTime(value.updatedAt);
  const mergedAt = value.mergedAt === null ? null : parseDateTime(value.mergedAt);

  if (
    value.url !== expectedUrl ||
    createdAt === null ||
    updatedAt === null ||
    createdAt > updatedAt ||
    (mergedAt !== null && (createdAt > mergedAt || mergedAt > updatedAt))
  ) {
    return false;
  }

  if (
    (value.relationship === "personal" && repositoryOwner.toLowerCase() !== LOGIN) ||
    (value.relationship !== "personal" && repositoryOwner.toLowerCase() === LOGIN)
  ) {
    return false;
  }

  switch (value.state) {
    case "merged":
      return value.mergedAt !== null;
    case "open":
    case "closed":
    case "draft":
      return value.mergedAt === null;
    default:
      return false;
  }
}

function validateCalendar(value: unknown): value is GitHubSnapshot["calendar"] {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["from", "to", "days"]) ||
    parseDateOnly(value.from) === null ||
    parseDateOnly(value.to) === null ||
    !Array.isArray(value.days) ||
    value.days.length === 0 ||
    value.days.length > MAX_CALENDAR_DAYS
  ) {
    return false;
  }

  const from = parseDateOnly(value.from);
  const to = parseDateOnly(value.to);
  if (from === null || to === null || from > to || value.days.length !== (to - from) / 86_400_000 + 1) {
    return false;
  }

  let previousTimestamp: number | null = null;
  for (const [index, rawDay] of value.days.entries()) {
    if (
      !isRecord(rawDay) ||
      !hasExactKeys(rawDay, ["date", "count", "level"]) ||
      parseDateOnly(rawDay.date) === null ||
      typeof rawDay.count !== "number" ||
      !Number.isSafeInteger(rawDay.count) ||
      rawDay.count < 0 ||
      rawDay.count > MAX_COUNT ||
      typeof rawDay.level !== "number" ||
      !Number.isInteger(rawDay.level) ||
      rawDay.level < 0 ||
      rawDay.level > 4
    ) {
      return false;
    }

    const timestamp = parseDateOnly(rawDay.date);
    if (
      timestamp === null ||
      (previousTimestamp !== null && timestamp - previousTimestamp !== 86_400_000) ||
      (index === 0 && timestamp !== from) ||
      (index === value.days.length - 1 && timestamp !== to) ||
      (rawDay.count === 0 && rawDay.level !== 0) ||
      (rawDay.count > 0 && rawDay.level === 0)
    ) {
      return false;
    }

    previousTimestamp = timestamp;
  }

  return true;
}

export function validateGitHubSnapshot(value: unknown): GitHubSnapshot {
  const snapshotKeys = ["version", "login", "updatedAt", "pullRequests", "counts", "calendar"];
  if (
    !isRecord(value) ||
    !snapshotKeys.every((key) => key in value) ||
    Object.keys(value).some((key) => key !== "featured" && !snapshotKeys.includes(key)) ||
    value.version !== 1 ||
    value.login !== LOGIN ||
    typeof value.updatedAt !== "string" ||
    parseDateTime(value.updatedAt) === null ||
    !isRecord(value.pullRequests) ||
    !hasExactKeys(value.pullRequests, PR_SCOPES) ||
    !isRecord(value.counts) ||
    !hasExactKeys(value.counts, ["open", "merged"]) ||
    typeof value.counts.open !== "number" ||
    !Number.isSafeInteger(value.counts.open) ||
    value.counts.open < 0 ||
    value.counts.open > MAX_TOTAL_COUNT ||
    typeof value.counts.merged !== "number" ||
    !Number.isSafeInteger(value.counts.merged) ||
    value.counts.merged < 0 ||
    value.counts.merged > MAX_TOTAL_COUNT ||
    !validateCalendar(value.calendar)
  ) {
    throw new Error("Invalid GitHub snapshot shape");
  }

  for (const scope of PR_SCOPES) {
    const records = value.pullRequests[scope];
    if (!Array.isArray(records) || records.length > 3 || !records.every(validatePullRequest)) {
      throw new Error(`Invalid GitHub ${scope} pull requests`);
    }
    const urls = new Set<string>();
    for (const [index, request] of records.entries()) {
      const dateKey = scope === "open" ? "updatedAt" : "createdAt";
      if (
        urls.has(request.url) ||
        (scope === "external" && request.relationship === "personal") ||
        (scope === "open" && request.state !== "open" && request.state !== "draft") ||
        (index > 0 && Date.parse(request[dateKey]) > Date.parse(records[index - 1][dateKey]))
      ) {
        throw new Error(`Invalid GitHub ${scope} pull-request ordering or scope`);
      }
      urls.add(request.url);
    }
  }

  const openRecords = value.pullRequests.open;
  if (!Array.isArray(openRecords)) {
    throw new Error("Invalid GitHub open pull requests");
  }

  if (
    openRecords.length !== Math.min(value.counts.open, 3)
  ) {
    throw new Error("GitHub open pull-request totals do not match records");
  }

  if (value.featured !== undefined) {
    if (
      !Array.isArray(value.featured) ||
      value.featured.length === 0 ||
      value.featured.length > 10 ||
      !value.featured.every(validatePullRequest) ||
      new Set(value.featured.map((request) => request.url)).size !== value.featured.length
    ) {
      throw new Error("Invalid GitHub featured pull requests");
    }
  }

  return value as unknown as GitHubSnapshot;
}

export function getCalendarStats(calendar: GitHubSnapshot["calendar"]): {
  totalContributions: number;
  activeDays: number;
  lastActiveDate: string | null;
} {
  let totalContributions = 0;
  let activeDays = 0;
  let lastActiveDate: string | null = null;

  for (const day of calendar.days) {
    totalContributions += day.count;
    if (day.count > 0) {
      activeDays += 1;
      lastActiveDate = day.date;
    }
  }

  return { totalContributions, activeDays, lastActiveDate };
}
