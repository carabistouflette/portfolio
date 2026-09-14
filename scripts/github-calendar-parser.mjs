import { parseFragment } from "parse5";

const MAX_HTML_BYTES = 2_000_000;
const DAY_MS = 86_400_000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = new Map([
  ["January", 1],
  ["February", 2],
  ["March", 3],
  ["April", 4],
  ["May", 5],
  ["June", 6],
  ["July", 7],
  ["August", 8],
  ["September", 9],
  ["October", 10],
  ["November", 11],
  ["December", 12],
]);

function attributes(node) {
  const result = new Map();
  for (const attribute of node.attrs ?? []) {
    if (result.has(attribute.name)) {
      throw new Error(`Duplicate ${attribute.name} attribute`);
    }
    result.set(attribute.name, attribute.value);
  }
  return result;
}

function textContent(node) {
  let text = "";
  for (const child of node.childNodes ?? []) {
    if (child.nodeName === "#text") {
      text += child.value;
    } else {
      text += textContent(child);
    }
  }
  return text;
}

function collectNodes(node, callback) {
  callback(node);
  for (const child of node.childNodes ?? []) {
    collectNodes(child, callback);
  }
}

function parseDate(value) {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid contribution date: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid contribution date: ${value}`);
  }
  return timestamp;
}

function parseTooltip(text, date) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const dateMatch = /(?:No contributions|[0-9][0-9,]* contribution(?:s)?) on ([A-Za-z]+) (\d{1,2})(?:st|nd|rd|th)\.$/.exec(
    normalized,
  );
  if (!dateMatch) {
    throw new Error(`Unexpected contribution tooltip: ${normalized}`);
  }

  const month = MONTHS.get(dateMatch[1]);
  const dayOfMonth = Number(dateMatch[2]);
  const dateObject = new Date(date);
  if (
    month === undefined ||
    dateObject.getUTCMonth() + 1 !== month ||
    dateObject.getUTCDate() !== dayOfMonth
  ) {
    throw new Error(`Contribution tooltip date does not match ${normalized}`);
  }

  if (normalized.startsWith("No contributions on ")) {
    return 0;
  }

  const countMatch = /^(\d[\d,]*) contribution(?:s)? on /.exec(normalized);
  if (!countMatch) {
    throw new Error(`Unexpected contribution count: ${normalized}`);
  }

  const countText = countMatch[1];
  if (
    !/^(?:0|[1-9]\d*)$/.test(countText) &&
    !/^[1-9]\d{0,2}(?:,\d{3})+$/.test(countText)
  ) {
    throw new Error(`Invalid contribution count: ${countText}`);
  }
  const count = Number(countText.replaceAll(",", ""));
  if (!Number.isSafeInteger(count) || count < 1 || count > 10_000) {
    throw new Error(`Contribution count is out of bounds: ${countText}`);
  }
  if ((count === 1 && !normalized.includes(" contribution on ")) || (count !== 1 && !normalized.includes(" contributions on "))) {
    throw new Error(`Contribution singularity is inconsistent: ${normalized}`);
  }
  return count;
}

function isContributionCell(node) {
  if (node.nodeName !== "td") {
    return false;
  }

  const attrs = attributes(node);
  const classes = new Set((attrs.get("class") ?? "").split(/\s+/).filter(Boolean));
  return (
    classes.has("ContributionCalendar-day") ||
    attrs.has("data-date") ||
    attrs.has("data-level") ||
    (attrs.get("id") ?? "").startsWith("contribution-day-component-")
  );
}

export function parseGitHubCalendarHtml(html) {
  if (typeof html !== "string" || html.length === 0 || html.length > MAX_HTML_BYTES) {
    throw new Error("GitHub contribution HTML is empty or too large");
  }

  const fragment = parseFragment(html);
  const cells = [];
  const tooltips = new Map();
  const tooltipIds = new Set();

  collectNodes(fragment, (node) => {
    if (isContributionCell(node)) {
      const attrs = attributes(node);
      if (
        !attrs.has("id") ||
        !attrs.has("data-date") ||
        !attrs.has("data-level") ||
        !/^[0-4]$/.test(attrs.get("data-level"))
      ) {
        throw new Error("Contribution cell is missing date, level, or id");
      }
      if (tooltipIds.has(attrs.get("id"))) {
        throw new Error(`Duplicate contribution cell: ${attrs.get("id")}`);
      }
      tooltipIds.add(attrs.get("id"));
      cells.push({
        id: attrs.get("id"),
        date: attrs.get("data-date"),
        level: Number(attrs.get("data-level")),
      });
      return;
    }

    if (node.nodeName === "tool-tip") {
      const attrs = attributes(node);
      const target = attrs.get("for");
      if (target?.startsWith("contribution-day-component-")) {
        if (tooltips.has(target)) {
          throw new Error(`Duplicate contribution tooltip: ${target}`);
        }
        tooltips.set(target, textContent(node));
      }
    }
  });

  if (cells.length === 0) {
    throw new Error("No contribution cells found");
  }
  for (const target of tooltips.keys()) {
    if (!tooltipIds.has(target)) {
      throw new Error(`Unexpected contribution tooltip: ${target}`);
    }
  }


  const parsedCells = cells
    .map((cell) => ({ ...cell, timestamp: parseDate(cell.date) }))
    .sort((left, right) => left.timestamp - right.timestamp);
  const days = [];
  const seenDates = new Set();
  let previousDate = null;
  for (const cell of parsedCells) {
    if (seenDates.has(cell.date)) {
      throw new Error(`Duplicate contribution date: ${cell.date}`);
    }
    if (previousDate !== null && cell.timestamp - previousDate !== DAY_MS) {
      throw new Error(`Contribution dates are not contiguous at ${cell.date}`);
    }

    const tooltip = tooltips.get(cell.id);
    if (tooltip === undefined) {
      throw new Error(`Missing contribution tooltip for ${cell.id}`);
    }
    const count = parseTooltip(tooltip, cell.timestamp);
    if ((count === 0 && cell.level !== 0) || (count > 0 && cell.level === 0)) {
      throw new Error(`Contribution count and level disagree for ${cell.date}`);
    }

    days.push({ date: cell.date, count, level: cell.level });
    seenDates.add(cell.date);
    previousDate = cell.timestamp;
  }

  return {
    from: days[0].date,
    to: days.at(-1).date,
    days,
  };
}
