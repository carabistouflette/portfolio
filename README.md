# Alexis Robin — Portfolio

Portfolio personnel construit avec [Astro](https://astro.build) et Tailwind CSS.

```sh
pnpm install
pnpm dev      # développement sur localhost:4321
pnpm build    # build statique
pnpm preview  # aperçu du build
pnpm deploy   # déploiement Cloudflare
```

Vérifications : `pnpm check`, `pnpm lint`, `pnpm format`.

## Démonstrations des projets

Les médias, sorties et empreintes de provenance sont dans `public/evidence/`.
La vidéo Sillage est une capture native d’un build local, sur un document de
démonstration, sans modèle. L’empreinte du binaire est enregistrée ; son commit
de compilation n’est pas établi. Elle n’est pas un benchmark.

Les exemples utilisent des entrées synthétiques ; leurs sources et empreintes
sont enregistrées dans `public/evidence/provenance.json` :

- HealthGraphBench : code MAUDE public à la révision
  `b010d5a49eae56837a920b2e30dece41c42c0c44` du dépôt
  `carabistouflette/HealthGraphBench`. Les empreintes des modules utilisés sont
  conservées dans le fichier de provenance.
  Placer la racine de cette révision dans `PYTHONPATH`, puis exécuter
  `python3 scripts/evidence/meddatatrace_example.py` avec Python 3.11 ou ultérieur.
  L’exemple vérifie les frontières temporelles sur deux trimestres fictifs.
- Vote-O-Matic : révision `386dbb6aa9a9348d0155b99604dafd197254d608`.
  Compiler ses sources Java et `scripts/evidence/PortfolioVotingDemo.java` avec
  Java 17+ et les dépendances Bouncy Castle 1.78.1 du `pom.xml` (`bcprov`, `bcpkix`,
  `bcutil`) dans le classpath, puis exécuter `PortfolioVotingDemo`. Le programme
  utilise les services réels de chiffrement, de preuve et de décompte ; le
  stockage de clés est désactivé pour cette démonstration en mémoire.

Les scripts vérifient les résultats avant de les afficher. Ces scénarios ne
constituent ni une validation clinique ni un audit de sécurité.

## Licence

[GPL-3.0](LICENSE)
