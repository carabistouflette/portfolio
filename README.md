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

Le grain du moteur Canvas 2D est mis en cache à sa fréquence d’origine de 16 Hz, puis mélangé en `screen` au-dessus des papillons. Le cache est invalidé au redimensionnement et libéré à la destruction du moteur ; les flous, les poses et le budget de pixels restent inchangés.

Les projections Canvas réutilisent les six valeurs trigonométriques de rotation d’une pose et le point partagé entre deux bandes d’aile adjacentes. Les 24 bandes par aile, les textures, les trajectoires, les flous et la résolution de rendu restent inchangés.

Les passes de flou Canvas sont limitées aux bornes natives des bandes projetées, avec leur recouvrement et la marge gaussienne d’origine. Seul ce rectangle est recomposé sur le fond ; la transformation de l’image source et ses fractions de pixel restent inchangées. Les tampons sont réutilisés sans lecture de pixels par frame. Le rayon du flou, le grain, les poses, le nombre de papillons et la cadence d’animation ne sont pas réduits.

Le moteur Canvas 2D ignore aussi les papillons entièrement hors du viewport vertical avant de projeter leurs bandes et de les flouter. La borne inclut toute la surface de pose et la marge gaussienne : les papillons partiellement visibles restent dessinés, et le scroll inverse retrouve la même pose. La simulation, le nombre de papillons et le rendu visible ne changent pas.

Les redimensionnements identiques ne réallouent ni ne redessinent les surfaces. Les changements réels remettent à l’échelle les positions, les destinations et les limites de vol ; le cache de fond est invalidé aussi lors d’un changement de `gradient`. Le nombre réduit par la qualité adaptative reste cohérent après resize et ne dépasse jamais le nombre demandé. Après un gel adaptatif, `reseed()` reprend la lecture seulement si les états de pause, de visibilité et de mouvement l’autorisent ; le scroll continue à reprojeter la pose gelée.

En WebGL, la perte de contexte suspend la boucle et libère les références aux ressources GPU. La restauration reconstruit les textures, les maillages et la cible de rendu, même sans changement de dimensions, puis reprend uniquement si les états de lecture l’autorisent. Le moteur Canvas reste le rendu par défaut.

Les vols d’icônes du catalogue annulent aussi leur démarrage différé lors d’un nouveau clic, d’une navigation ou du passage au mouvement réduit ; durée et trajectoires restent identiques. La photo conserve son parallax de ±56 px et son échelle de 1,14 : les mesures de scroll sont suspendues loin de l’image et les écritures identiques sont évitées. Resize, changements de mise en page et grands sauts de scroll actualisent sa géométrie.

Toutes les sections partagent `--section-space: clamp(4rem, 6vw, 7rem)` en padding supérieur et inférieur, sans surcharge locale pour les projets, la partie personnelle ou le contact. L’espace reste généreux mais sa progression et son plafond sont réduits sur grand écran. Le budget de hauteur des cartes mobiles tient compte de cet espacement.

La section « Compétences » conserve uniquement son titre et le catalogue étirable, en français comme en anglais. L’aperçu du catalogue, l’ouverture des catégories et le bouton de fermeture restent disponibles ; les trois colonnes de présentation au-dessus ont été retirées. L’en-tête « Expérience & formation » suit l’espacement partagé des sections, sans barre de séparation ni espacement supérieur supplémentaire.

Le parcours conserve deux frises horizontales pleine largeur sur desktop : formation et expérience, chacune avec ses années et ses périodes. La frise des expériences commence au premier stage, sans colonnes d’années vides. Les barres supérieures et les séparateurs des détails sont supprimés ; les espaces internes sont réduits et les logos gardent leur taille d’origine. Sur mobile, les entrées restent verticales et lisibles. Les détails, le lien vers le dossier CIRAD et l’invitation à contacter restent disponibles.

La section GitHub conserve son titre et remplace son surtitre et son introduction par une bannière de profil compacte : avatar GitHub chargé à la demande, pseudo issu du snapshot et lien vers le compte. Les projets et le calendrier restent affichés. Les sections personnelles et de contact conservent leurs titres et leur contenu, sans les surtitres « Un autre rythme » et « Contact & opportunités ».

Les variantes `softA` et `softC` partagent leur corps identique : une seule image décodée et une seule texture préparée par moteur. Le rafraîchissement de l’exposition et la destruction traitent chaque texture une seule fois ; les quatre variantes d’ailes restent distinctes.

Les attributs `sizes` du chat, des captures et de la photo suivent leurs emplacements CSS réels, y compris les gutters, les colonnes, les plafonds du shell et les échelles de hover/parallax. Les candidats `srcset` et les styles restent inchangés ; la visionneuse charge toujours les captures originales.

## Études de cas

La section « Mes projets » utilise une grille pondérée : GenomInt et Maestria occupent chacun une colonne entière sur desktop, soit deux tiers de la grille à eux deux ; Vote chiffré et Brio partagent la troisième. Sur petit écran, les deux projets principaux prennent chacun toute la largeur et les secondaires partagent la dernière ligne ; des résumés courts évitent de réduire la police. Les hauteurs suivent le viewport, sans couper le contenu sur les écrans trop courts ou lors d’un zoom. Chaque bloc est un lien natif unique vers son dossier ou son site, accessible sur toute sa surface et au clavier. Le graphe SVG ne se met à jour que lors du déplacement du pointeur, au maximum une fois par frame.

Les cartes affichent le titre, des icônes uniquement pour les technologies, une description très courte, puis les concepts en texte clair au bas du bloc. Les icônes réutilisent `ToolIcon.astro` et conservent leur nom au survol et pour les lecteurs d’écran. Les descriptions détaillées restent dans les dossiers projets.

GenomInt affiche aussi Pi, LangChain et Haystack dans ses technologies ; les trois sont reliés au projet dans le catalogue. Pi utilise un glyphe π, tandis que LangChain et Haystack réutilisent leurs logos du catalogue.

Les illustrations remplissent les deux grands blocs : quatre rayonnages de livres à reliures sobres pour Maestria, un réseau de catégories biologiques inspiré de l’explorateur réel pour GenomInt. Les catégories ont des tailles et couleurs différenciées, sans métriques en direct. Un masque SVG réserve un espace autour de chaque nœud pour qu’aucun lien ne traverse les cercles. Le voile de lecture suit la hauteur du texte, sans flou. Chaque livre dispose d’un dos, d’une couverture et d’un bloc de pages ; la perspective CSS n’est activée que pour les livres manipulés. Une seule animation Web Animations de 400 ms avance le volume entier au-delà de sa profondeur avant de le pivoter ; le rangement inverse ces étapes depuis la pose courante. La fin du rangement libère le volume et son indication temporaire `will-change`, sans minuterie de libération. Les animations sont annulées à la navigation et au passage en mode de mouvement réduit. Aucun livre n’est déclenché par le focus de la carte. Le graphe conserve une lecture de sa transformation par image de pointeur pour suivre le défilement et l’entrée animée, applique directement son inverse affine 2D et ne modifie les classes des nœuds que lorsque leur proximité change.

La perspective de chaque livre est centrée sur son propre emplacement, au pied du dos, et non sur le rayonnage entier. Seul le volume intérieur bouge ; la zone de survol reste fixe et ignore ses faces projetées, pour éviter les décalages latéraux et les déclenchements sur les livres voisins.

Les pages projets françaises et anglaises partagent `CaseStudy.astro` et `EvidenceFigure.astro` : le bloc média affiche une galerie de captures ou un diagramme selon les données de `src/data/portfolio.ts`. Ajouter un identifiant à `CaseStudyId` et ses données dans les deux langues de `caseStudies` crée ses deux routes. Les quatre captures GenomInt sont dans `public/images/genomint-*.webp`, avec aperçus `-1100.webp` et ouverture en visionneuse (zoom et déplacement). La capture d’administration masque les identités des comptes : conserver cette anonymisation lors de tout remplacement.

Le dossier Vote chiffré existe en français et en anglais. Il présente le projet universitaire Java/Spring, El Gamal et les preuves à connaissance zéro ; son diagramme est pédagogique et ne prétend décrire ni un protocole précis ni une preuve de sécurité.

## Vérifications

```sh
pnpm check      # astro check
pnpm lint       # eslint
pnpm format     # prettier --check
```

Les caches `.astro` générés sont exclus du lint, à la racine comme dans les sous-dossiers de `src/`.

## Build et déploiement

```sh
pnpm build      # sync GitHub + build statique
pnpm deploy     # build + wrangler deploy (Cloudflare)
```

## Licence

[GPL-3.0](LICENSE)
