import { onPageLoad } from "./page-lifecycle";

function setupCopyEmail(signal: AbortSignal): void {
  const copyButtons =
    document.querySelectorAll<HTMLButtonElement>("[data-copy-email]");

  copyButtons.forEach((button) => {
    const copyIcon = button.querySelector(".copy-icon");
    const checkIcon = button.querySelector(".check-icon");
    const label = button.querySelector(".copy-label");
    const copiedText = button.dataset.copiedLabel;
    const defaultText = button.dataset.defaultLabel;
    let timeoutId: number | undefined;

    signal.addEventListener(
      "abort",
      () => {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
          timeoutId = undefined;
        }
      },
      { once: true },
    );

    button.addEventListener(
      "click",
      async () => {
        const email = button.dataset.copyEmail;
        if (!email) return;

        try {
          await navigator.clipboard.writeText(email);
          if (signal.aborted) return;

          if (
            copyIcon &&
            checkIcon &&
            label &&
            copiedText !== undefined &&
            defaultText !== undefined
          ) {
            copyIcon.classList.add("hidden");
            checkIcon.classList.remove("hidden");
            label.textContent = copiedText;

            if (timeoutId !== undefined) window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
              timeoutId = undefined;
              copyIcon.classList.remove("hidden");
              checkIcon.classList.add("hidden");
              label.textContent = defaultText;
            }, 2400);
          }
        } catch {
          if (signal.aborted) return;
          window.location.href = `mailto:${email}`;
        }
      },
      { signal },
    );
  });
}

function setupBackToTop(signal: AbortSignal): void {
  const backToTopButtons =
    document.querySelectorAll<HTMLButtonElement>("[data-back-to-top]");

  backToTopButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({
          top: 0,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      { signal },
    );
  });
}

onPageLoad((signal) => {
  setupCopyEmail(signal);
  setupBackToTop(signal);
});
