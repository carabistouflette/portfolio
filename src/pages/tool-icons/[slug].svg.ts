import type { APIRoute, GetStaticPaths } from "astro";
import { allBrandIcons, brandIconColor } from "../../lib/tool-icons";

export const getStaticPaths = (() =>
  allBrandIcons.map((icon) => ({
    params: { slug: icon.slug },
    props: { path: icon.path, color: brandIconColor(icon) },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { path, color } = props;
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="${path}"/></svg>`,
    { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } },
  );
};
