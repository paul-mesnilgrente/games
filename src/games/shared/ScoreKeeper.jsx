import { useMemo, useState } from 'react'

// A reusable round-by-round score keeper used by most games.
//
//   <ScoreKeeper
//     defaultPlayers={['Team A', 'Team B']}
//     label="team"           // noun used in the UI ("player" / "team")
//     targetScore={501}      // optional: highlight a winner past this score
//     lowestWins={false}     // true for games where fewest points wins (e.g. Rami)
//   />
export default function ScoreKeeper({
  defaultPlayers = ['Player 1', 'Player 2'],
  label = 'player',
  targetScore = null,
  lowestWins = false,
}) {
  const [players, setPlayers] = useState(defaultPlayers)
  // rounds[i] = array of numbers, one per player
  const [rounds, setRounds] = useState([])
  // the row currently being typed in, before it's committed
  const [draft, setDraft] = useState(() => players.map(() => ''))

  const totals = useMemo(
    () =>
      players.map((_, p) =>
        rounds.reduce((sum, round) => sum + (round[p] || 0), 0),
      ),
    [players, rounds],
  )

  const leader = useMemo(() => {
    if (rounds.length === 0) return null
    const best = lowestWins ? Math.min(...totals) : Math.max(...totals)
    return totals.indexOf(best)
  }, [totals, rounds.length, lowestWins])

  const winnerReached =
    targetScore != null && totals.some((t) => t >= targetScore)

  function renamePlayer(index, name) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? name : p)))
  }

  function addPlayer() {
    setPlayers((prev) => [...prev, `${capitalize(label)} ${prev.length + 1}`])
    setDraft((prev) => [...prev, ''])
    setRounds((prev) => prev.map((round) => [...round, 0]))
  }

  function removePlayer(index) {
    if (players.length <= 1) return
    setPlayers((prev) => prev.filter((_, i) => i !== index))
    setDraft((prev) => prev.filter((_, i) => i !== index))
    setRounds((prev) => prev.map((round) => round.filter((_, i) => i !== index)))
  }

  function commitRound() {
    const numeric = draft.map((v) => Number(v) || 0)
    if (numeric.every((v) => v === 0) && draft.every((v) => v === '')) return
    setRounds((prev) => [...prev, numeric])
    setDraft(players.map(() => ''))
  }

  function editRound(roundIndex, playerIndex, value) {
    setRounds((prev) =>
      prev.map((round, r) =>
        r === roundIndex
          ? round.map((v, p) => (p === playerIndex ? Number(value) || 0 : v))
          : round,
      ),
    )
  }

  function deleteRound(roundIndex) {
    setRounds((prev) => prev.filter((_, r) => r !== roundIndex))
  }

  function reset() {
    setRounds([])
    setDraft(players.map(() => ''))
  }

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center mb-3">
          <thead className="table-dark">
            <tr>
              <th style={{ width: '4rem' }}>#</th>
              {players.map((name, p) => (
                <th key={p}>
                  <div className="d-flex align-items-center gap-1">
                    <input
                      className="form-control form-control-sm text-center fw-bold"
                      value={name}
                      onChange={(e) => renamePlayer(p, e.target.value)}
                      aria-label={`${label} ${p + 1} name`}
                    />
                    {players.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light border-0"
                        onClick={() => removePlayer(p)}
                        title={`Remove ${label}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rounds.map((round, r) => (
              <tr key={r}>
                <td className="text-muted">
                  {r + 1}
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0 ms-1"
                    onClick={() => deleteRound(r)}
                    title="Delete round"
                  >
                    ×
                  </button>
                </td>
                {round.map((value, p) => (
                  <td key={p}>
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      value={value}
                      onChange={(e) => editRound(r, p, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}

            {/* draft row for the next round */}
            <tr className="table-light">
              <td className="text-muted fst-italic">new</td>
              {draft.map((value, p) => (
                <td key={p}>
                  <input
                    type="number"
                    className="form-control form-control-sm text-center"
                    value={value}
                    placeholder="0"
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev.map((v, i) => (i === p ? e.target.value : v)),
                      )
                    }
                    onKeyDown={(e) => e.key === 'Enter' && commitRound()}
                  />
                </td>
              ))}
            </tr>
          </tbody>

          <tfoot>
            <tr className="fw-bold fs-5">
              <td>Σ</td>
              {totals.map((total, p) => (
                <td
                  key={p}
                  className={
                    leader === p && rounds.length > 0
                      ? 'table-success'
                      : undefined
                  }
                >
                  {total}
                  {leader === p && rounds.length > 0 && ' 👑'}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="d-flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={commitRound}>
          Add round
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={addPlayer}
        >
          + Add {label}
        </button>
        <button
          type="button"
          className="btn btn-outline-danger ms-auto"
          onClick={reset}
        >
          Reset scores
        </button>
      </div>

      {winnerReached && (
        <div className="alert alert-success mt-3 mb-0">
          🎉 <strong>{players[leader]}</strong> reached {targetScore}!
        </div>
      )}
    </div>
  )
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
