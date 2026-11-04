import type { APIRoute } from "astro";
import { caseStudies } from "../data/portfolio";

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://alexisrob.in");
  const pairs = [
    { fr: "/", en: "/en/" },
    { fr: "/github/", en: "/en/github/" },
    ...Object.keys(caseStudies.fr).map((id) => {
      const key = id as keyof typeof caseStudies.fr;
      return { fr: caseStudies.fr[key].path, en: caseStudies.en[key].path };
    }),
  ];
  const absolute = (path: string) => new URL(path, origin).href;
  const entries = pairs.flatMap((pair) =>
    Object.values(pair).map(
      (path) => `
  <url>
    <loc>${absolute(path)}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${absolute(pair.fr)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${absolute(pair.en)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(pair.fr)}" />
  </url>`,
    ),
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join("")}
</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
