import ScoreKeeper from '../shared/ScoreKeeper.jsx'

export const meta = {
  title: 'Belote',
  description: 'Count Belote scores between two teams — first to 501 wins.',
  icon: '♠️',
}

export default function Belote() {
  return (
    <>
      <h1 className="mb-1">♠️ Belote</h1>
      <p className="text-muted">
        Enter each team's points per deal. First team to 501 wins.
      </p>
      <ScoreKeeper
        storageKey="belote"
        defaultPlayers={['Us', 'Them']}
        label="team"
        targetScore={501}
      />
    </>
  )
}
