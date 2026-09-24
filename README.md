# Alexis Robin - Portfolio

Portfolio personnel : IA, systèmes logiciels et logiciel libre. Construit avec [Astro](https://astro.build), Tailwind CSS 4 et quelques composants Vue.

## Développement

```sh
pnpm install
pnpm dev        # serveur de dev sur localhost:4321
```

## Études de cas

Les pages projets françaises et anglaises partagent `CaseStudy.astro` et `EvidenceFigure.astro` : le bloc média affiche une galerie de captures ou un diagramme selon les données de `src/data/portfolio.ts`. Ajouter un identifiant à `CaseStudyId` et ses données dans les deux langues de `caseStudies` crée ses deux routes. Les quatre captures GenomInt sont dans `public/images/genomint-*.webp`, avec aperçus `-1100.webp` et ouverture en visionneuse (zoom et déplacement). La capture d’administration masque les identités des comptes : conserver cette anonymisation lors de tout remplacement.

## Vérifications

```sh
pnpm check      # astro check
pnpm lint       # eslint
pnpm format     # prettier --check
```

## Build et déploiement

```sh
pnpm build      # sync GitHub + build statique
pnpm deploy     # build + wrangler deploy (Cloudflare)
```

## Licence

[GPL-3.0](LICENSE)
