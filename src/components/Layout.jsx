import { Link, NavLink, Outlet } from 'react-router-dom'
import { games } from '../games/registry.js'

export default function Layout() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            🎮 Games
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navItems"
            aria-controls="navItems"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navItems">
            <ul className="navbar-nav ms-auto">
              {games.map((game) => (
                <li className="nav-item" key={game.slug}>
                  <NavLink className="nav-link" to={`/${game.slug}`}>
                    {game.icon} {game.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>

      <footer className="border-top py-3 mt-auto">
        <div className="container text-center text-muted small">
          paul-mesnilgrente.com/games
        </div>
      </footer>
    </>
  )
}
