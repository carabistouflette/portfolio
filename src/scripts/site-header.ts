import { onPageLoad } from "./page-lifecycle";

const MENU_TRANSITION_DURATION = 320;

function getSameDocumentFragmentId(href: string | null): string | null {
  if (!href) return null;

  const target = new URL(href, document.baseURI);
  if (
    target.origin !== window.location.origin ||
    target.pathname !== window.location.pathname ||
    target.search !== window.location.search
  ) {
    return null;
  }

  const fragment = target.hash.slice(1);
  if (!fragment) return null;

  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

function setupMobileMenu(signal: AbortSignal): void {
  const header = document.querySelector<HTMLElement>(".site-header");
  const toggle = header?.querySelector<HTMLButtonElement>(
    ".header-menu-toggle",
  );
  const menu = header?.querySelector<HTMLElement>("#header-menu");
  if (!header || !toggle || !menu) return;

  const mobile = window.matchMedia("(max-width: 47.999rem)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let closeTimer: number | undefined;
  let openFrame: number | undefined;

  const clearMenuTimers = (): void => {
    if (closeTimer !== undefined) {
      window.clearTimeout(closeTimer);
      closeTimer = undefined;
    }
    if (openFrame !== undefined) {
      window.cancelAnimationFrame(openFrame);
      openFrame = undefined;
    }
  };

  signal.addEventListener("abort", clearMenuTimers, { once: true });

  const setOpen = (open: boolean, immediate = false): void => {
    const isMobile = mobile.matches;
    const nextOpen = isMobile && open;
    clearMenuTimers();
    toggle.setAttribute("aria-expanded", String(nextOpen));

    if (!isMobile) {
      delete header.dataset.menuOpen;
      menu.hidden = false;
      return;
    }

    if (nextOpen) {
      menu.hidden = false;
      openFrame = window.requestAnimationFrame(() => {
        openFrame = undefined;
        if (toggle.getAttribute("aria-expanded") === "true")
          header.dataset.menuOpen = "";
      });
      return;
    }

    delete header.dataset.menuOpen;
    if (immediate || reducedMotion.matches) {
      menu.hidden = true;
      return;
    }

    closeTimer = window.setTimeout(() => {
      closeTimer = undefined;
      if (toggle.getAttribute("aria-expanded") !== "true") menu.hidden = true;
    }, MENU_TRANSITION_DURATION);
  };

  const syncViewport = (): void => {
    if (!mobile.matches && document.activeElement === toggle) {
      header.querySelector<HTMLAnchorElement>(".header-signature")?.focus();
    } else if (mobile.matches && menu.contains(document.activeElement)) {
      toggle.focus();
    }
    setOpen(false, true);
  };

  toggle.hidden = false;
  header.dataset.menuReady = "";
  syncViewport();

  toggle.addEventListener(
    "click",
    () => setOpen(toggle.getAttribute("aria-expanded") !== "true"),
    { signal },
  );

  header.addEventListener(
    "click",
    (event) => {
      if (!mobile.matches) return;

      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a")
          : null;
      if (!link) return;
      setOpen(false);
      const id = getSameDocumentFragmentId(link.getAttribute("href"));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      const cleanupFocusTarget = (): void => {
        target.removeAttribute("tabindex");
        signal.removeEventListener("abort", cleanupFocusTarget);
      };
      target.addEventListener("blur", cleanupFocusTarget, {
        once: true,
        signal,
      });
      signal.addEventListener("abort", cleanupFocusTarget, { once: true });
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        setOpen(false);
        toggle.focus();
      }
    },
    { signal },
  );

  document.addEventListener(
    "click",
    (event) => {
      if (event.target instanceof Node && !header.contains(event.target))
        setOpen(false);
    },
    { signal },
  );

  header.addEventListener(
    "focusout",
    (event) => {
      if (
        event.relatedTarget instanceof Node &&
        !header.contains(event.relatedTarget)
      ) {
        setOpen(false);
      }
    },
    { signal },
  );

  mobile.addEventListener("change", syncViewport, { signal });
}

function setupActiveSection(signal: AbortSignal): void {
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"),
  );
  const navLinkIds = navLinks.map((link) =>
    getSameDocumentFragmentId(link.getAttribute("href")),
  );
  const sections = navLinkIds
    .map((id) => (id ? document.getElementById(id) : null))
    .filter((section): section is HTMLElement => section !== null);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const visibility = new Map<Element, IntersectionObserverEntry>();
  const setActive = (id: string): void => {
    navLinks.forEach((link, index) => {
      if (navLinkIds[index] === id) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => visibility.set(entry.target, entry));

      let active: IntersectionObserverEntry | undefined;
      for (const entry of visibility.values()) {
        if (
          entry.isIntersecting &&
          (!active || entry.intersectionRatio > active.intersectionRatio)
        ) {
          active = entry;
        }
      }

      if (active) setActive(active.target.id);
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] },
  );

  signal.addEventListener("abort", () => observer.disconnect(), {
    once: true,
  });
  sections.forEach((section) => observer.observe(section));
}

onPageLoad((signal) => {
  setupMobileMenu(signal);
  setupActiveSection(signal);
});
