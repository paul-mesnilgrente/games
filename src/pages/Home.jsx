import { Link } from 'react-router-dom'
import { games } from '../games/registry.js'

export default function Home() {
  return (
    <>
      <div className="text-center mb-5">
        <div className="fs-2 mb-2" aria-hidden="true">
          <span style={{ color: '#f7f0dd' }}>♠</span>{' '}
          <span style={{ color: '#e77b81' }}>♥</span>{' '}
          <span style={{ color: '#e77b81' }}>♦</span>{' '}
          <span style={{ color: '#f7f0dd' }}>♣</span>
        </div>
        <h1 className="display-5 fw-bold">Score keepers</h1>
        <p className="lead text-soft">Pick a game to start counting.</p>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {games.map((game) => (
          <div className="col" key={game.slug}>
            <Link
              to={`/${game.slug}`}
              className="card h-100 text-decoration-none text-reset shadow-sm game-card"
            >
              <div className="card-body">
                <div className="display-6 mb-2">{game.icon}</div>
                <h5 className="card-title">{game.title}</h5>
                <p className="card-text text-muted">{game.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <p className="text-center text-muted">
          No games yet. Add a folder under <code>src/games/</code> to get started.
        </p>
      )}
    </>
  )
}
