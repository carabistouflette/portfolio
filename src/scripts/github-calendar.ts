import {
  getCalendarStats,
  type GitHubDay,
  type GitHubSnapshot,
} from "../lib/github";
import type { PortfolioContent } from "../data/portfolio";
type Calendar = GitHubSnapshot["calendar"];
type View = "year" | "month";
type CalendarCopy = PortfolioContent["openSource"]["github"]["calendar"];

type DayPosition = { row: number; col: number };
type CalendarState = {
  calendar: Calendar;
  view: View;
  month: string;
  selected: string | null;
};

const PROFILE_URL = "https://github.com/carabistouflette";
const DAY_MS = 86_400_000;
const LEVEL_CLASSES: Record<GitHubDay["level"], string> = {
  0: "bg-sky-950/70",
  1: "bg-sky-800/80",
  2: "bg-sky-600/90",
  3: "bg-sky-400",
  4: "bg-sky-200",
};
type CalendarFormatters = {
  date: Intl.DateTimeFormat;
  month: Intl.DateTimeFormat;
  shortMonth: Intl.DateTimeFormat;
  weekday: Intl.DateTimeFormat;
};
const formatterCache = new Map<string, CalendarFormatters>();
const getFormatters = (locale: string): CalendarFormatters => {
  const cached = formatterCache.get(locale);
  if (cached) return cached;
  const formatters = {
    date: new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    month: new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    shortMonth: new Intl.DateTimeFormat(locale, {
      month: "short",
      timeZone: "UTC",
    }),
    weekday: new Intl.DateTimeFormat(locale, {
      weekday: "short",
      timeZone: "UTC",
    }),
  };
  formatterCache.set(locale, formatters);
  return formatters;
};

const dateAtUtc = (date: string): Date => new Date(`${date}T00:00:00Z`);
const dateKey = (date: Date): string => date.toISOString().slice(0, 10);
const addDays = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
};
const startOfWeek = (date: Date): Date => addDays(date, -date.getUTCDay());
const monthKey = (date: string): string => date.slice(0, 7);
const monthStart = (month: string): Date => new Date(`${month}-01T00:00:00Z`);
const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });

const isCalendarDay = (value: unknown): value is GitHubDay => {
  if (!value || typeof value !== "object") return false;
  const day = value as Partial<GitHubDay>;
  return (
    typeof day.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
    Number.isInteger(day.count) &&
    (day.count ?? -1) >= 0 &&
    Number.isInteger(day.level) &&
    (day.level ?? -1) >= 0 &&
    (day.level ?? 5) <= 4
  );
};

const readCopy = (root: HTMLElement): CalendarCopy => {
  const raw = root.getAttribute("data-copy");
  if (!raw) throw new Error("GitHub calendar copy is missing");
  const copy = JSON.parse(raw) as Partial<CalendarCopy>;
  const keys: (keyof CalendarCopy)[] = [
    "heading",
    "intro",
    "viewLabel",
    "yearLabel",
    "monthLabel",
    "monthPickerLabel",
    "previousLabel",
    "nextLabel",
    "lessLabel",
    "moreLabel",
    "daySingular",
    "dayPlural",
    "zeroDayLabel",
    "inspectLabel",
    "selectionLabel",
    "navigationHint",
    "activeDaysLabel",
    "totalLabel",
    "lastActiveLabel",
    "noActivityLabel",
  ];
  for (const key of keys) {
    if (typeof copy[key] !== "string")
      throw new Error(`GitHub calendar copy key is missing: ${key}`);
  }
  return copy as CalendarCopy;
};

const readInitialCalendar = (root: HTMLElement): Calendar => {
  const from = root.dataset.calendarFrom;
  const to = root.dataset.calendarTo;
  if (!from || !to) throw new Error("GitHub calendar range is missing");
  const days = Array.from(
    root.querySelectorAll<HTMLElement>("[data-github-day]"),
  )
    .map((element) => ({
      date: element.dataset.date ?? "",
      count: Number(element.dataset.count),
      level: Number(element.dataset.level),
    }))
    .filter(isCalendarDay)
    .map((day) => ({ ...day, level: day.level as GitHubDay["level"] }))
    .sort((left, right) => left.date.localeCompare(right.date));
  return { from, to, days };
};

const formatDate = (locale: string, date: string): string =>
  getFormatters(locale).date.format(dateAtUtc(date));
const formatMonth = (locale: string, month: string): string =>
  getFormatters(locale).month.format(monthStart(month));
const formatShortMonth = (locale: string, date: Date): string =>
  getFormatters(locale).shortMonth.format(date);
const formatWeekday = (locale: string, index: number): string =>
  getFormatters(locale).weekday.format(new Date(Date.UTC(2023, 0, 1 + index)));

const getMonths = (calendar: Calendar): string[] => {
  const months = new Set<string>();
  for (const day of calendar.days) months.add(monthKey(day.date));
  if (months.size === 0 && calendar.from <= calendar.to) {
    const cursor = monthStart(monthKey(calendar.from));
    const end = monthStart(monthKey(calendar.to));
    while (cursor <= end) {
      months.add(monthKey(dateKey(cursor)));
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }
  return [...months].sort();
};

const closestDate = (
  desired: string | null,
  days: GitHubDay[],
): string | null => {
  if (days.length === 0) return null;
  if (!desired) return days.at(-1)?.date ?? null;
  return (
    days.find((day) => day.date >= desired)?.date ?? days.at(-1)?.date ?? null
  );
};
const closestMonth = (desired: string | null, months: string[]): string => {
  if (months.length === 0) return "";
  if (!desired) return months.at(-1) ?? months[0];
  return months.find((month) => month >= desired) ?? months.at(-1) ?? months[0];
};

const dayDescription = (
  day: GitHubDay,
  copy: CalendarCopy,
  locale: string,
): string => {
  const template =
    day.count === 0
      ? copy.zeroDayLabel
      : day.count === 1
        ? copy.daySingular
        : copy.dayPlural;
  return template
    .replaceAll("{date}", formatDate(locale, day.date))
    .replaceAll("{count}", String(day.count));
};
const hrefForDay = (date: string): string =>
  `${PROFILE_URL}?tab=overview&from=${date}&to=${date}`;
const dayClass = (day: GitHubDay, showNumber: boolean): string => {
  const size = showNumber
    ? "min-h-11 min-w-11 text-sm"
    : "min-h-5 min-w-5 text-[0.6rem]";
  return `github-calendar-day grid ${size} place-items-center rounded-sm text-ink transition-colors motion-reduce:transition-none hover:ring-2 hover:ring-paper focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-paper focus-visible:outline-offset-3 data-[selected=true]:ring-2 data-[selected=true]:ring-paper data-[selected=true]:ring-offset-2 data-[selected=true]:ring-offset-ink data-[level=0]:text-paper data-[level=1]:text-paper ${LEVEL_CLASSES[day.level]}`;
};

const renderDay = (
  day: GitHubDay,
  copy: CalendarCopy,
  locale: string,
  position: DayPosition,
  selected: string | null,
  showNumber: boolean,
  preview = false,
): string => {
  const selectedAttribute = selected === day.date ? "true" : "false";
  const description = escapeHtml(dayDescription(day, copy, locale));
  const tag = preview ? "span" : "a";
  return `<${tag} class="${dayClass(day, showNumber)}" role="${preview ? "cell" : "gridcell"}" data-github-day data-date="${day.date}" data-count="${day.count}" data-level="${day.level}" data-grid-row="${position.row}" data-grid-col="${position.col}" data-selected="${selectedAttribute}" ${preview ? "" : `aria-selected="${selectedAttribute}" href="${hrefForDay(day.date)}" tabindex="-1"`} aria-label="${description}" title="${description}">${showNumber ? `<span aria-hidden="true">${day.date.slice(8)}</span>` : '<span aria-hidden="true"></span>'}</${tag}>`;
};
const renderUnavailable = (showNumber = false): string => {
  const size = showNumber ? "min-h-11 min-w-11 text-sm" : "min-h-5 min-w-5";
  return `<span class="${size}" role="gridcell" aria-hidden="true"></span>`;
};

const renderYear = (
  calendar: Calendar,
  copy: CalendarCopy,
  locale: string,
  selected: string | null,
  preview = false,
): string => {
  const days = new Map(calendar.days.map((day) => [day.date, day]));
  const from = dateAtUtc(calendar.from);
  const to = dateAtUtc(calendar.to);
  const firstWeek = startOfWeek(from);
  const weekCount = Math.max(
    1,
    Math.floor((to.getTime() - firstWeek.getTime()) / DAY_MS / 7) + 1,
  );
  const monthMarkers: string[] = [];
  for (let week = 0; week < weekCount; week += 1) {
    const current = addDays(firstWeek, week * 7);
    const previous =
      week === 0
        ? ""
        : formatShortMonth(locale, addDays(firstWeek, (week - 1) * 7));
    const label = formatShortMonth(locale, current);
    if (label !== previous)
      monthMarkers.push(
        `<span class="truncate pb-1 text-[0.68rem] text-muted" aria-hidden="true" style="grid-row:1;grid-column:${week + 2} / span ${Math.min(4, weekCount - week)}">${escapeHtml(label)}</span>`,
      );
  }
  const rows = Array.from({ length: 7 }, (_, weekday) => {
    const cells = Array.from({ length: weekCount }, (_, week) => {
      const date = addDays(firstWeek, week * 7 + weekday);
      const key = dateKey(date);
      const day = date >= from && date <= to ? days.get(key) : undefined;
      return day
        ? renderDay(
            day,
            copy,
            locale,
            { row: weekday, col: week },
            selected,
            false,
            preview,
          )
        : renderUnavailable();
    }).join("");
    return `<div class="contents" role="row"><span class="flex items-center text-[0.68rem] text-muted" role="rowheader">${escapeHtml(formatWeekday(locale, weekday))}</span>${cells}</div>`;
  }).join("");
  return `<div class="min-w-0 overflow-x-auto pb-3" data-github-calendar-year-panel ${preview ? `tabindex="0" aria-label="${escapeHtml(copy.yearLabel)}"` : ""}><div class="min-w-[52rem]" data-github-calendar-grid-wrapper><div class="grid gap-x-1" aria-hidden="true" data-github-calendar-month-markers style="grid-template-columns:2.75rem repeat(${weekCount},minmax(1.15rem,1fr));"><div></div>${monthMarkers.join("")}</div><div class="grid gap-x-1 gap-y-1" role="${preview ? "table" : "grid"}" aria-label="${escapeHtml(copy.yearLabel)}" aria-rowcount="7" aria-colcount="${weekCount}" data-github-calendar-grid style="grid-template-columns:2.75rem repeat(${weekCount},minmax(1.15rem,1fr));">${rows}</div></div></div>`;
};

const renderMonth = (
  calendar: Calendar,
  copy: CalendarCopy,
  locale: string,
  selected: string | null,
  month: string,
): string => {
  const days = new Map(calendar.days.map((day) => [day.date, day]));
  const from = dateAtUtc(calendar.from);
  const to = dateAtUtc(calendar.to);
  const first = monthStart(month);
  const last = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  );
  const firstWeek = startOfWeek(first);
  const rows = Array.from({ length: 6 }, (_, row) => {
    const cells = Array.from({ length: 7 }, (_, col) => {
      const date = addDays(firstWeek, row * 7 + col);
      const key = dateKey(date);
      const inMonth =
        date.getUTCMonth() === first.getUTCMonth() &&
        date.getUTCFullYear() === first.getUTCFullYear();
      const day =
        inMonth && date >= from && date <= to ? days.get(key) : undefined;
      return day
        ? renderDay(day, copy, locale, { row, col }, selected, true)
        : renderUnavailable(true);
    }).join("");
    return `<div class="contents" role="row"><span class="sr-only">${row + 1}</span>${cells}</div>`;
  }).join("");
  const weekdayHeaders = Array.from(
    { length: 7 },
    (_, index) =>
      `<span class="text-center text-xs text-muted" role="columnheader">${escapeHtml(formatWeekday(locale, index))}</span>`,
  ).join("");
  return `<div data-github-calendar-month-panel><div class="mb-4 flex items-baseline justify-between gap-4"><h4 class="text-base font-medium" data-github-calendar-current-month>${escapeHtml(formatMonth(locale, month))}</h4><span class="text-xs text-muted">${escapeHtml(`${formatDate(locale, dateKey(first))} — ${formatDate(locale, dateKey(last))}`)}</span></div><div class="grid grid-cols-7 gap-1" role="grid" aria-label="${escapeHtml(formatMonth(locale, month))}" aria-rowcount="6" aria-colcount="7"><div class="contents" role="row">${weekdayHeaders}</div>${rows}</div></div>`;
};

export interface GitHubCalendarController {
  update(calendar: Calendar): void;
}

export function initGitHubCalendar(
  root: HTMLElement,
): GitHubCalendarController {
  const copy = readCopy(root);
  const locale = root.dataset.locale ?? "en";
  if (root.hasAttribute("data-calendar-preview")) {
    const panels = root.querySelector<HTMLElement>(
      "[data-github-calendar-panels]",
    )!;
    const range = root.querySelector<HTMLElement>(
      "[data-github-calendar-range]",
    )!;
    root.dataset.githubCalendarInitialized = "true";
    return {
      update(calendar: Calendar): void {
        const scrollLeft = panels.firstElementChild?.scrollLeft ?? 0;
        panels.innerHTML = renderYear(calendar, copy, locale, null, true);
        panels.firstElementChild!.scrollLeft = scrollLeft;
        range.textContent = `${formatDate(locale, calendar.from)} — ${formatDate(locale, calendar.to)}`;
      },
    };
  }
  const initialCalendar = readInitialCalendar(root);
  const months = getMonths(initialCalendar);
  const mediaQuery = window.matchMedia("(max-width: 48rem), (pointer: coarse)");
  const initialSelected = closestDate(
    root.querySelector<HTMLElement>("[data-github-day][data-selected='true']")
      ?.dataset.date ?? null,
    initialCalendar.days,
  );
  const state: CalendarState = {
    calendar: initialCalendar,
    view: mediaQuery.matches ? "month" : "year",
    month: closestMonth(
      initialSelected ? monthKey(initialSelected) : null,
      months,
    ),
    selected: initialSelected,
  };

  const controls = root.querySelector<HTMLElement>(
    "[data-github-calendar-controls]",
  );
  const monthControls = root.querySelector<HTMLElement>(
    "[data-github-calendar-month-controls]",
  );
  const panels = root.querySelector<HTMLElement>(
    "[data-github-calendar-panels]",
  );
  const monthPicker = root.querySelector<HTMLSelectElement>(
    "[data-github-calendar-month-picker]",
  );
  const previous = root.querySelector<HTMLButtonElement>(
    "[data-github-calendar-previous]",
  );
  const next = root.querySelector<HTMLButtonElement>(
    "[data-github-calendar-next]",
  );
  const range = root.querySelector<HTMLElement>("[data-github-calendar-range]");
  const selection = root.querySelector<HTMLElement>(
    "[data-github-calendar-selection]",
  );
  const inspect = root.querySelector<HTMLAnchorElement>(
    "[data-github-calendar-inspect]",
  );
  const stats = {
    total: root.querySelector<HTMLElement>(
      "[data-github-calendar-stat='total']",
    ),
    active: root.querySelector<HTMLElement>(
      "[data-github-calendar-stat='active']",
    ),
    last: root.querySelector<HTMLElement>("[data-github-calendar-stat='last']"),
  };
  if (
    !controls ||
    !monthControls ||
    !panels ||
    !monthPicker ||
    !previous ||
    !next ||
    !range ||
    !selection ||
    !inspect
  ) {
    throw new Error("GitHub calendar markup is incomplete");
  }

  const getDays = (): GitHubDay[] => state.calendar.days;
  const getDay = (date: string | null): GitHubDay | undefined =>
    getDays().find((day) => day.date === date);
  const syncSelectionAttributes = (): void => {
    for (const day of root.querySelectorAll<HTMLElement>("[data-github-day]")) {
      const isSelected = day.dataset.date === state.selected;
      day.dataset.selected = String(isSelected);
      day.setAttribute("aria-selected", String(isSelected));
      day.tabIndex = isSelected ? 0 : -1;
    }
  };
  const updateInspector = (): void => {
    const day = getDay(state.selected);
    if (!day) {
      selection.textContent = copy.noActivityLabel;
      inspect.hidden = true;
      inspect.removeAttribute("href");
      return;
    }
    selection.textContent = dayDescription(day, copy, locale);
    inspect.hidden = false;
    inspect.href = hrefForDay(day.date);
  };
  const updateStats = (): void => {
    const computed = getCalendarStats(state.calendar);
    if (stats.total)
      stats.total.textContent =
        computed.totalContributions.toLocaleString(locale);
    if (stats.active)
      stats.active.textContent = computed.activeDays.toLocaleString(locale);
    if (stats.last)
      stats.last.textContent = computed.lastActiveDate
        ? formatDate(locale, computed.lastActiveDate)
        : copy.noActivityLabel;
    range.textContent = `${formatDate(locale, state.calendar.from)} — ${formatDate(locale, state.calendar.to)}`;
  };
  const updateMonthControls = (): void => {
    const availableMonths = getMonths(state.calendar);
    monthPicker.replaceChildren(
      ...availableMonths.map((month) => {
        const option = document.createElement("option");
        option.value = month;
        option.textContent = formatMonth(locale, month);
        option.selected = month === state.month;
        return option;
      }),
    );
    const index = Math.max(0, availableMonths.indexOf(state.month));
    previous.disabled = index <= 0;
    next.disabled = index < 0 || index >= availableMonths.length - 1;
    monthControls.hidden = state.view !== "month";
  };
  const updateViewButtons = (): void => {
    for (const button of root.querySelectorAll<HTMLButtonElement>(
      "[data-github-calendar-view-button]",
    )) {
      const active = button.dataset.githubCalendarViewButton === state.view;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("border-paper", active);
      button.classList.toggle("border-transparent", !active);
      button.classList.toggle("text-muted", !active);
    }
  };
  const focusDayAfterRender = (date: string | null): void => {
    if (!date) return;
    const target = Array.from(
      root.querySelectorAll<HTMLElement>("[data-github-day]"),
    ).find((day) => day.dataset.date === date);
    target?.focus({ preventScroll: true });
  };
  const render = (focusDate: string | null = null): void => {
    const availableMonths = getMonths(state.calendar);
    state.month = closestMonth(state.month, availableMonths);
    state.selected = closestDate(state.selected, state.calendar.days);
    panels.innerHTML =
      state.view === "year"
        ? renderYear(state.calendar, copy, locale, state.selected)
        : renderMonth(
            state.calendar,
            copy,
            locale,
            state.selected,
            state.month,
          );
    updateViewButtons();
    updateMonthControls();
    syncSelectionAttributes();
    updateInspector();
    updateStats();
    focusDayAfterRender(focusDate);
  };
  const selectMonth = (month: string): void => {
    state.month = month;
    const firstDayInMonth = state.calendar.days.find(
      (day) => monthKey(day.date) === month,
    );
    state.selected = firstDayInMonth?.date ?? null;
    render();
  };
  const setSelected = (date: string | null): void => {
    if (!date || !getDay(date)) return;
    state.selected = date;
    syncSelectionAttributes();
    updateInspector();
  };
  const moveDay = (
    origin: HTMLElement,
    direction: "left" | "right" | "up" | "down" | "home" | "end",
  ): void => {
    const row = Number(origin.dataset.gridRow);
    const col = Number(origin.dataset.gridCol);
    if (!Number.isInteger(row) || !Number.isInteger(col)) return;
    const daysByPosition = new Map<string, HTMLElement>();
    let maxRow = 0;
    let maxCol = 0;
    for (const day of root.querySelectorAll<HTMLElement>("[data-github-day]")) {
      const dayRow = Number(day.dataset.gridRow);
      const dayCol = Number(day.dataset.gridCol);
      if (!Number.isInteger(dayRow) || !Number.isInteger(dayCol)) continue;
      daysByPosition.set(`${dayRow}:${dayCol}`, day);
      maxRow = Math.max(maxRow, dayRow);
      maxCol = Math.max(maxCol, dayCol);
    }
    if (direction === "home" || direction === "end") {
      const rowDays = [...daysByPosition.entries()]
        .filter(([position]) => Number(position.split(":")[0]) === row)
        .sort(
          ([left], [right]) =>
            Number(left.split(":")[1]) - Number(right.split(":")[1]),
        )
        .map(([, day]) => day);
      const candidate = direction === "home" ? rowDays[0] : rowDays.at(-1);
      if (candidate) {
        candidate.focus();
        setSelected(candidate.dataset.date ?? null);
      }
      return;
    }
    const rowDelta = direction === "up" ? -1 : direction === "down" ? 1 : 0;
    const colDelta = direction === "left" ? -1 : direction === "right" ? 1 : 0;
    let nextRow = row + rowDelta;
    let nextCol = col + colDelta;
    while (
      nextRow >= 0 &&
      nextRow <= maxRow &&
      nextCol >= 0 &&
      nextCol <= maxCol
    ) {
      const candidate = daysByPosition.get(`${nextRow}:${nextCol}`);
      if (candidate) {
        candidate.focus();
        setSelected(candidate.dataset.date ?? null);
        return;
      }
      nextRow += rowDelta;
      nextCol += colDelta;
    }
  };

  controls.hidden = false;
  root.dataset.githubCalendarInitialized = "true";
  root.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-github-day]")
        : null;
    if (target?.dataset.date) {
      if (!event.ctrlKey && !event.metaKey) event.preventDefault();
      setSelected(target.dataset.date);
    }
    const viewButton =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>(
            "[data-github-calendar-view-button]",
          )
        : null;
    if (
      viewButton?.dataset.githubCalendarViewButton === "year" ||
      viewButton?.dataset.githubCalendarViewButton === "month"
    ) {
      state.view = viewButton.dataset.githubCalendarViewButton;
      if (state.view === "month" && state.selected)
        state.month = monthKey(state.selected);
      render();
    }
  });
  root.addEventListener("focusin", (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-github-day]")
        : null;
    if (target?.dataset.date) {
      setSelected(target.dataset.date);
    }
  });
  root.addEventListener("keydown", (event) => {
    const target =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>("[data-github-day]")
        : null;
    if (!target) return;
    const keyMap: Record<
      string,
      "left" | "right" | "up" | "down" | "home" | "end"
    > = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
      Home: "home",
      End: "end",
    };
    const direction = keyMap[event.key];
    if (direction) {
      event.preventDefault();
      moveDay(target, direction);
    } else if (event.key === " ") {
      event.preventDefault();
      setSelected(target.dataset.date ?? null);
    } else if (event.key === "Enter") {
      setSelected(target.dataset.date ?? null);
    }
  });
  monthPicker.addEventListener("change", () => {
    selectMonth(monthPicker.value);
  });
  previous.addEventListener("click", () => {
    const availableMonths = getMonths(state.calendar);
    const index = availableMonths.indexOf(state.month);
    if (index > 0) selectMonth(availableMonths[index - 1] ?? state.month);
  });
  next.addEventListener("click", () => {
    const availableMonths = getMonths(state.calendar);
    const index = availableMonths.indexOf(state.month);
    if (index >= 0 && index < availableMonths.length - 1)
      selectMonth(availableMonths[index + 1] ?? state.month);
  });

  render();

  return {
    update(calendar: Calendar): void {
      const activeDay =
        root.ownerDocument.activeElement?.closest<HTMLElement>(
          "[data-github-day]",
        )?.dataset.date ?? null;
      const oldSelected = state.selected;
      const oldMonth = state.month;
      state.calendar = calendar;
      state.selected = closestDate(oldSelected, calendar.days);
      const availableMonths = getMonths(calendar);
      state.month = availableMonths.includes(oldMonth)
        ? oldMonth
        : closestMonth(oldMonth, availableMonths);
      render(
        activeDay && calendar.days.some((day) => day.date === activeDay)
          ? activeDay
          : null,
      );
    },
  };
}
