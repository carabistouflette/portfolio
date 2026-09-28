import { allBrandIcons } from "../lib/tool-icons";

/**
 * Shared SVG sprite consumed by `ToolIcon` via `<use href="/icons.svg#…">`.
 * Prerendered at build time so it stays in sync with `simple-icons`.
 */
export const GET = (): Response => {
  const symbols = allBrandIcons
    .map(
      (icon) =>
        `<symbol id="tool-si-${icon.slug}" viewBox="0 0 24 24"><path d="${icon.path}"/></symbol>`,
    )
    .join("");
  const body = `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
  return new Response(body, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
};
