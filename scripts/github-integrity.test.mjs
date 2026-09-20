import assert from "node:assert/strict";
import test from "node:test";
import { parseGitHubCalendarHtml } from "./github-calendar-parser.mjs";
import { toPullRequest } from "./sync-github.mjs";
import { getCalendarStats, validateGitHubSnapshot } from "../src/lib/github.ts";

function calendarCell(date, id, level, tooltip) {
  return `<td class="ContributionCalendar-day" id="${id}" data-date="${date}" data-level="${level}"></td><tool-tip for="${id}">${tooltip}</tool-tip>`;
}

function validSnapshot() {
  return {
    version: 1,
    login: "carabistouflette",
    updatedAt: "2026-01-01T00:00:00Z",
    pullRequests: { recent: [], external: [], open: [] },
    counts: { open: 0, merged: 0 },
    calendar: {
      from: "2026-01-01",
      to: "2026-01-03",
      days: [
        { date: "2026-01-01", count: 0, level: 0 },
        { date: "2026-01-02", count: 2, level: 1 },
        { date: "2026-01-03", count: 0, level: 0 },
      ],
    },
  };
}

test("calendar parser orders cells and preserves actual boundaries", () => {
  const html = [
    calendarCell(
      "2026-01-02",
      "contribution-day-component-2",
      1,
      "2 contributions on January 2nd.",
    ),
    calendarCell(
      "2026-01-01",
      "contribution-day-component-1",
      0,
      "No contributions on January 1st.",
    ),
    calendarCell(
      "2026-01-03",
      "contribution-day-component-3",
      0,
      "No contributions on January 3rd.",
    ),
  ].join("");

  assert.deepEqual(parseGitHubCalendarHtml(html), {
    from: "2026-01-01",
    to: "2026-01-03",
    days: [
      { date: "2026-01-01", count: 0, level: 0 },
      { date: "2026-01-02", count: 2, level: 1 },
      { date: "2026-01-03", count: 0, level: 0 },
    ],
  });
});

test("calendar parser rejects missing tooltips and date gaps", () => {
  assert.throws(() =>
    parseGitHubCalendarHtml(
      '<td class="ContributionCalendar-day" id="contribution-day-component-1" data-date="2026-01-01" data-level="0"></td>',
    ),
  );

  assert.throws(() =>
    parseGitHubCalendarHtml(
      [
        calendarCell(
          "2026-01-01",
          "contribution-day-component-1",
          0,
          "No contributions on January 1st.",
        ),
        calendarCell(
          "2026-01-03",
          "contribution-day-component-3",
          0,
          "No contributions on January 3rd.",
        ),
      ].join(""),
    ),
  );
});

test("calendar stats retain zero-activity boundaries", () => {
  const snapshot = validateGitHubSnapshot(validSnapshot());
  assert.deepEqual(getCalendarStats(snapshot.calendar), {
    totalContributions: 2,
    activeDays: 1,
    lastActiveDate: "2026-01-02",
  });
});

test("snapshot validator rejects hostile pull-request URLs", () => {
  const snapshot = validSnapshot();
  snapshot.pullRequests.recent.push({
    repository: "someone/project",
    number: 7,
    title: "A public pull request",
    url: "https://evil.example/someone/project/pull/7",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    mergedAt: null,
    state: "open",
    relationship: "external",
  });

  assert.throws(() => validateGitHubSnapshot(snapshot));
});

test("sync parser rejects search results authored by another login", () => {
  assert.throws(() =>
    toPullRequest({
      user: { login: "another-account" },
      repository_url: "https://api.github.com/repos/example/project",
      number: 7,
      title: "Public pull request",
      html_url: "https://github.com/example/project/pull/7",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      state: "open",
      draft: false,
      author_association: "NONE",
      pull_request: { merged_at: null },
    }),
  );
});

test("snapshot validator rejects partial calendar data", () => {
  const snapshot = validSnapshot();
  snapshot.calendar.days.splice(1, 1);
  assert.throws(() => validateGitHubSnapshot(snapshot));
});

test("snapshot scopes cannot misrepresent personal or closed pull requests", () => {
  const request = {
    repository: "carabistouflette/project",
    number: 1,
    title: "A public change",
    url: "https://github.com/carabistouflette/project/pull/1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    mergedAt: null,
    state: "closed",
    relationship: "personal",
  };
  const external = validSnapshot();
  external.pullRequests.external = [request];
  assert.throws(() => validateGitHubSnapshot(external));
  const open = validSnapshot();
  open.counts.open = 1;
  open.pullRequests.open = [request];
  assert.throws(() => validateGitHubSnapshot(open));
});

function featuredPullRequest() {
  return {
    repository: "brio-labs/maestria",
    number: 485,
    title: "feat(runtime): per-artifact vector effects, 2x dense ingest",
    url: "https://github.com/brio-labs/maestria/pull/485",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
    mergedAt: "2026-01-02T00:00:00Z",
    state: "merged",
    relationship: "organization",
  };
}

test("snapshot validator accepts dynamic featured pull requests", () => {
  const withFeatured = validSnapshot();
  withFeatured.featured = [featuredPullRequest()];
  assert.doesNotThrow(() => validateGitHubSnapshot(withFeatured));
  // backward compatibility: snapshots without featured stay valid
  assert.doesNotThrow(() => validateGitHubSnapshot(validSnapshot()));
});

test("snapshot validator rejects malformed or duplicated featured pull requests", () => {
  const malformed = validSnapshot();
  malformed.featured = [
    {
      ...featuredPullRequest(),
      url: "https://evil.example/brio-labs/maestria/pull/485",
    },
  ];
  assert.throws(() => validateGitHubSnapshot(malformed));
  const duplicated = validSnapshot();
  duplicated.featured = [featuredPullRequest(), featuredPullRequest()];
  assert.throws(() => validateGitHubSnapshot(duplicated));
  const empty = validSnapshot();
  empty.featured = [];
  assert.throws(() => validateGitHubSnapshot(empty));
});
