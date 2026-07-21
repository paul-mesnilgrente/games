import ScoreKeeper from '../shared/ScoreKeeper.jsx'

export const meta = {
  title: 'Rami achète',
  description: 'Count Rummy scores round by round — lowest total wins.',
  icon: '🃏',
}

export default function RamiAchete() {
  return (
    <>
      <h1 className="mb-1">🃏 Rami achète</h1>
      <p className="text-muted">
        Enter each player's penalty points per round. Lowest total is winning.
      </p>
      <ScoreKeeper
        defaultPlayers={['Player 1', 'Player 2', 'Player 3']}
        label="player"
        lowestWins
      />
    </>
  )
}
