document.addEventListener("astro:after-swap", () => {
  document.documentElement.dataset.pageNavigation = "";
});

export function onPageLoad(setup: (signal: AbortSignal) => void): void {
  document.addEventListener("astro:page-load", () => {
    const controller = new AbortController();
    document.addEventListener("astro:before-swap", () => controller.abort(), {
      once: true,
    });
    setup(controller.signal);
  });
}
