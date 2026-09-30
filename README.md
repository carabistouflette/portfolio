# Alexis Robin - Portfolio

Portfolio personnel : IA, systèmes logiciels et logiciel libre. Construit avec [Astro](https://astro.build) et Tailwind CSS 4, sans framework côté client.

## Développement

```sh
pnpm install
pnpm dev        # serveur de dev sur localhost:4321
```

## Rendu et performances

Les flous d’origine sont conservés pour les apparitions, le menu, l’en-tête, la carte de contact et la visionneuse. Les blocs hors écran ne portent pas de filtre en attente ; le flou n’est activé qu’au début de leur apparition. Une fois terminées, les animations d’apparition des blocs sont libérées ; leurs états nets utilisent `filter: none` plutôt qu’un filtre de rayon nul.

Le voile de la visionneuse conserve `blur(16px) saturate(70%)`, mais son animation d’entrée est libérée après `340ms` ; le filtre permanent reste actif. Les effets d’entrée du titre et du chat conservent leur composition finale d’origine : les libérer change leur rasterisation dans Chromium.

Le moteur Canvas 2D compose chaque papillon à sa résolution native, puis applique le flou gaussien d’origine après la déformation des ailes, dans une petite surface transparente bordée et réutilisée. Le résultat est dessiné sans filtre sur le canvas plein écran : ni réduction de résolution des poses ni textures préfloutées. Le moteur WebGL, accessible avec `/?renderer=webgl`, conserve son filtre d’origine. Le fond animé est suspendu pendant l’ouverture du menu plein écran ou de la visionneuse, puis reprend si les états de lecture, de visibilité et de qualité adaptative le permettent. Les options `butterflyBlur`, `butterflyDepthBlur` et `butterflyMotionBlur` restent réglables via `window.butterflyField.setOptions()`. Les animations respectent `prefers-reduced-motion`.

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
