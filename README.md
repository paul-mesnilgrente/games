# Games

A small collection of card-game score keepers, hosted at
**https://paul-mesnilgrente.com/games**.

Built with [Vite](https://vitejs.dev/) + React + React Router, styled with
Bootstrap.

## Adding a new game (the whole point)

1. Create a folder: `src/games/<slug>/index.jsx`
   (the folder name becomes the URL — `/games/<slug>`).
2. Export a `meta` object and a default React component:

   ```jsx
   export const meta = {
     title: 'Tarot',
     description: 'Count Tarot scores.',
     icon: '🎴', // optional
   }

   export default function Tarot() {
     return <h1>Tarot</h1>
   }
   ```

That's it. A card appears on the home page, a nav link appears, and the route
works. No imports, no route wiring — `src/games/registry.js` discovers every
game automatically with `import.meta.glob`.

Most games are just a thin wrapper around the shared
[`ScoreKeeper`](src/games/shared/ScoreKeeper.jsx) component — see
[`belote`](src/games/belote/index.jsx) and
[`rami-achete`](src/games/rami-achete/index.jsx) for examples.

## Develop

```bash
nvm use          # uses the LTS pinned in .nvmrc
npm install
npm run dev      # http://localhost:5173/games/
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages. In the repo settings, set **Pages → Source** to
**GitHub Actions**.

### Custom domain note

This repo is a *project* page. The apex domain `paul-mesnilgrente.com` must be
configured on the **user site** repo (`paul-mesnilgrente.github.io`). GitHub
then automatically serves this repo at `paul-mesnilgrente.com/games`, matching
the `base: '/games/'` in [`vite.config.js`](vite.config.js). Do **not** add a
`CNAME` file here — that would try to take over the whole domain.
