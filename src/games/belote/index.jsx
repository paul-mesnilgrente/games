import { useMemo, useState } from 'react'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

export const meta = {
  title: 'Belote',
  description: 'Compteur de manches avec mode de jeu, annonces et poule automatique.',
  icon: '♠️',
}

const CIBLE = 501

// Mode de jeu → poule de points des plis (dix de der inclus).
const MODES = [
  { key: 'normale', label: 'Normale', poule: 162 },
  { key: 'sansAtout', label: 'Sans atout', poule: 130 },
  { key: 'toutAtout', label: 'Tout atout', poule: 258 },
]
const MODE_BY_KEY = Object.fromEntries(MODES.map((m) => [m.key, m]))

// Annonces et leur valeur. Une même annonce peut être posée plusieurs fois.
//   100 = suite de 5, ou un carré qui n'est ni 7/8/9 ni valet (As, 10, R, D).
const ANNONCES = [
  { key: 'belote', label: 'Belote', value: 20 },
  { key: 'brelan', label: 'Brelan', value: 20 },
  { key: 'cinquante', label: '50', value: 50 },
  { key: 'cent', label: '100', value: 100 },
  { key: 'carre9', label: 'Carré de 9', value: 150 },
  { key: 'carreValet', label: 'Carré de valet', value: 200 },
  // Capot : l'équipe remporte tous les plis (l'autre finit à 0).
  { key: 'capot', label: 'Capot', value: 90 },
]
const ANNONCE_BY_KEY = Object.fromEntries(ANNONCES.map((a) => [a.key, a]))

export default function Belote() {
  const [equipes, setEquipes] = useLocalStorage('belote:equipes', ['Nous', 'Eux'])
  // manches[i] = { mode, plis: [nous, eux], annonces: [{ team, key }] }
  const [manches, setManches] = useLocalStorage('belote:manches', [])

  // --- Saisie de la manche en cours --------------------------------------
  const [mode, setMode] = useState('normale')
  const [plis, setPlis] = useState(['', '']) // chaînes saisies
  const [source, setSource] = useState(null) // équipe réellement tapée
  const [annoncesDraft, setAnnoncesDraft] = useState([]) // [{ team, key }]

  const poule = MODE_BY_KEY[mode].poule

  function saisirPlis(team, valeur) {
    if (valeur === '') {
      setPlis(['', ''])
      setSource(null)
      return
    }
    const num = Number(valeur) || 0
    const arr = ['', '']
    arr[team] = valeur
    arr[1 - team] = String(poule - num)
    setPlis(arr)
    setSource(team)
  }

  function changerMode(key) {
    setMode(key)
    const p = MODE_BY_KEY[key].poule
    setPlis((prev) => {
      if (source == null || prev[source] === '') return prev
      const num = Number(prev[source]) || 0
      const arr = ['', '']
      arr[source] = prev[source]
      arr[1 - source] = String(p - num)
      return arr
    })
  }

  function ajouterAnnonce(team, key) {
    setAnnoncesDraft((prev) => [...prev, { team, key }])
  }

  function retirerAnnonce(index) {
    setAnnoncesDraft((prev) => prev.filter((_, i) => i !== index))
  }

  const plisNum = [Number(plis[0]) || 0, Number(plis[1]) || 0]
  const totalDraft = [0, 1].map((t) => {
    const annonces = annoncesDraft
      .filter((a) => a.team === t)
      .reduce((s, a) => s + (ANNONCE_BY_KEY[a.key]?.value || 0), 0)
    return plisNum[t] + annonces
  })

  function validerManche() {
    const aDesPlis = source != null && plis[source] !== ''
    if (!aDesPlis && annoncesDraft.length === 0) return
    setManches((prev) => [
      ...prev,
      { mode, plis: plisNum, annonces: annoncesDraft.map((a) => ({ ...a })) },
    ])
    setPlis(['', ''])
    setSource(null)
    setAnnoncesDraft([])
  }

  function supprimerManche(index) {
    setManches((prev) => prev.filter((_, i) => i !== index))
  }

  function reinitialiser() {
    setManches([])
  }

  function renommer(team, nom) {
    setEquipes((prev) => prev.map((n, i) => (i === team ? nom : n)))
  }

  // --- Totaux & classement automatiques ----------------------------------
  const totauxManche = (m) => {
    const t = [m.plis[0] || 0, m.plis[1] || 0]
    m.annonces.forEach((a) => {
      t[a.team] += ANNONCE_BY_KEY[a.key]?.value || 0
    })
    return t
  }

  const totaux = useMemo(
    () =>
      manches.reduce(
        (acc, m) => {
          const t = totauxManche(m)
          return [acc[0] + t[0], acc[1] + t[1]]
        },
        [0, 0],
      ),
    [manches],
  )

  const leader =
    manches.length === 0 || totaux[0] === totaux[1]
      ? null
      : totaux[0] > totaux[1]
        ? 0
        : 1
  const gagnant = totaux.some((t) => t >= CIBLE)

  return (
    <>
      <h1 className="mb-1">♠️ Belote</h1>
      <p className="text-soft">
        Saisis chaque manche : mode de jeu, plis (la 2ᵉ équipe se calcule toute
        seule) et annonces. Première équipe à {CIBLE} points gagne.
      </p>

      {/* --- Saisie d'une nouvelle manche --- */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 mb-3">Nouvelle manche</h2>

          {/* Mode de jeu */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <div className="d-flex flex-wrap gap-1">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`btn btn-sm ${
                    mode === m.key ? 'btn-felt-solid' : 'btn-annonce'
                  }`}
                  onClick={() => changerMode(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <span className="text-muted small">Poule : {poule}</span>
          </div>

          {/* Plis */}
          <div className="row g-2 mb-3">
            {equipes.map((nom, team) => (
              <div className="col-6" key={team}>
                <label className="form-label small mb-1">Plis · {nom}</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="form-control"
                  value={plis[team]}
                  onChange={(e) => saisirPlis(team, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Annonces, par équipe */}
          <div className="row g-3">
            {equipes.map((nom, team) => (
              <div className="col-12 col-sm-6" key={team}>
                <div className="fw-semibold small mb-1">Annonces · {nom}</div>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {ANNONCES.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      className="btn btn-sm btn-annonce"
                      onClick={() => ajouterAnnonce(team, a.key)}
                      title={`${a.label} · ${a.value} pts`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <div className="d-flex flex-wrap gap-1">
                  {annoncesDraft
                    .map((a, idx) => ({ ...a, idx }))
                    .filter((a) => a.team === team)
                    .map((a) => (
                      <span key={a.idx} className="badge annonce-pill">
                        {ANNONCE_BY_KEY[a.key].label} +{ANNONCE_BY_KEY[a.key].value}
                        <button
                          type="button"
                          className="btn-pill-x"
                          onClick={() => retirerAnnonce(a.idx)}
                          aria-label="Retirer l'annonce"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <div className="me-auto">
              Manche : <strong>{equipes[0]}</strong> {totalDraft[0]} ·{' '}
              <strong>{equipes[1]}</strong> {totalDraft[1]}
            </div>
            <button type="button" className="btn btn-primary" onClick={validerManche}>
              Valider la manche
            </button>
          </div>
        </div>
      </div>

      {/* --- Historique des manches --- */}
      {manches.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center mb-3 score-table">
            <thead className="table-dark">
              <tr>
                <th className="score-label">Manche</th>
                {equipes.map((nom, team) => (
                  <th key={team}>
                    <input
                      className="form-control text-center name-input"
                      value={nom}
                      onChange={(e) => renommer(team, e.target.value)}
                      aria-label={`Nom de l'équipe ${team + 1}`}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {manches.map((m, i) => {
                const t = totauxManche(m)
                return (
                  <tr key={i}>
                    <td className="score-label text-start">
                      <div className="d-flex align-items-center gap-1">
                        <span className="fw-bold">{i + 1}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0"
                          onClick={() => supprimerManche(i)}
                          title="Supprimer la manche"
                        >
                          ×
                        </button>
                      </div>
                      <span className="badge annonce-pill">
                        {MODE_BY_KEY[m.mode]?.label ?? m.mode}
                      </span>
                    </td>
                    {equipes.map((_, team) => {
                      const labels = m.annonces
                        .filter((a) => a.team === team)
                        .map((a) => ANNONCE_BY_KEY[a.key]?.label ?? a.key)
                      return (
                        <td key={team}>
                          <div className="fw-bold fs-5">{t[team]}</div>
                          {labels.length > 0 && (
                            <div className="small text-muted">
                              {m.plis[team]} + {labels.join(' · ')}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>

            <tfoot>
              <tr className="fw-bold fs-5">
                <td className="score-label">Total</td>
                {totaux.map((total, team) => (
                  <td key={team} className={leader === team ? 'table-success' : undefined}>
                    {total}
                    {leader === team && ' 👑'}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2">
        <button type="button" className="btn btn-outline-danger ms-auto" onClick={reinitialiser}>
          Réinitialiser
        </button>
      </div>

      {gagnant && (
        <div className="alert alert-success mt-3 mb-0">
          🎉 <strong>{leader != null ? equipes[leader] : ''}</strong> atteint {CIBLE} !
        </div>
      )}
    </>
  )
}
