// ---------------------------------------------------------------------------
//  Game registry — the ONLY magic you need to understand.
//
//  To add a new game, create a folder under src/games/<slug>/ containing an
//  index.jsx that:
//
//     export const meta = {
//       title: 'My Game',
//       description: 'One line shown on the home page.',
//       icon: '🎲',            // optional emoji shown on the card
//     }
//     export default function MyGame() { ... }   // the game's React component
//
//  That's it. The folder name becomes the URL (/games/<slug>) and a card
//  appears on the home page automatically. No wiring, no imports, no routes.
// ---------------------------------------------------------------------------

// Eagerly import every game's index.jsx at build time.
const modules = import.meta.glob('./*/index.jsx', { eager: true })

export const games = Object.entries(modules)
  .map(([path, mod]) => {
    // './rami-achete/index.jsx' -> 'rami-achete'
    const slug = path.split('/')[1]
    if (!mod.default) {
      throw new Error(`Game "${slug}" is missing a default-exported component.`)
    }
    return {
      slug,
      Component: mod.default,
      title: mod.meta?.title ?? slug,
      description: mod.meta?.description ?? '',
      icon: mod.meta?.icon ?? '🎮',
    }
  })
  .sort((a, b) => a.title.localeCompare(b.title))

export const gamesBySlug = Object.fromEntries(games.map((g) => [g.slug, g]))
