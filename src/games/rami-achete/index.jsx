import { Fragment, useMemo } from 'react'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

export const meta = {
  title: 'Rami achète',
  description: 'Compteur de scores avec contrats, classement et parties gagnées.',
  icon: '🃏',
}

// ---------------------------------------------------------------------------
//  Contrats à réaliser pour chaque partie (rappel des combinaisons).
//  Édite librement cette liste : le nombre de lignes s'adapte tout seul.
//     brelan = 3 cartes identiques · suite = 3+ cartes qui se suivent
// ---------------------------------------------------------------------------
const CONTRATS = [
  '2 brelans',
  '1 suite de 4 + 1 brelan',
  '1 suite de 8',
  '3 brelans',
  '1 suite de 7 + 1 brelan',
  '2 suites de 4 + 1 brelan',
  '1 suite de 6 + 2 brelans',
]

const JOUEURS_PAR_DEFAUT = ['Joueur 1', 'Joueur 2', 'Joueur 3']

export default function RamiAchete() {
  const [joueurs, setJoueurs] = useLocalStorage(
    'rami-achete:joueurs',
    JOUEURS_PAR_DEFAUT,
  )
  // scores[partie][joueur] = chaîne saisie ('' = pas encore joué)
  const [scores, setScores] = useLocalStorage('rami-achete:scores', () =>
    CONTRATS.map(() => JOUEURS_PAR_DEFAUT.map(() => '')),
  )

  // --- Calcul automatique des totaux -------------------------------------
  const totaux = useMemo(
    () =>
      joueurs.map((_, j) =>
        scores.reduce((somme, partie) => somme + (Number(partie[j]) || 0), 0),
      ),
    [joueurs, scores],
  )

  // --- Classement automatique (le plus petit total gagne) ----------------
  const classement = useMemo(() => {
    const tries = joueurs
      .map((nom, index) => ({ nom, index, total: totaux[index] }))
      .sort((a, b) => a.total - b.total)
    // rang partagé en cas d'égalité
    let rang = 0
    let dernierTotal = null
    return tries.map((item, i) => {
      if (item.total !== dernierTotal) {
        rang = i + 1
        dernierTotal = item.total
      }
      return { ...item, rang }
    })
  }, [joueurs, totaux])

  const rangParJoueur = useMemo(() => {
    const map = {}
    classement.forEach((c) => (map[c.index] = c.rang))
    return map
  }, [classement])

  const partieCommencee = scores.some((partie) =>
    partie.some((v) => v !== ''),
  )

  // --- Actions ------------------------------------------------------------
  function renommer(index, nom) {
    setJoueurs((prev) => prev.map((n, i) => (i === index ? nom : n)))
  }

  function saisir(partie, joueur, valeur) {
    setScores((prev) =>
      prev.map((ligne, p) =>
        p === partie
          ? ligne.map((v, j) => (j === joueur ? valeur : v))
          : ligne,
      ),
    )
  }

  function ajouterJoueur() {
    setJoueurs((prev) => [...prev, `Joueur ${prev.length + 1}`])
    setScores((prev) => prev.map((ligne) => [...ligne, '']))
  }

  function retirerJoueur(index) {
    if (joueurs.length <= 1) return
    setJoueurs((prev) => prev.filter((_, i) => i !== index))
    setScores((prev) => prev.map((ligne) => ligne.filter((_, i) => i !== index)))
  }

  function reinitialiser() {
    setScores(CONTRATS.map(() => joueurs.map(() => '')))
  }

  // Pour une partie : min = gagnant (bleu), max = plus de points (rouge).
  function statsPartie(partie) {
    const valeurs = (scores[partie] ?? [])
      .map((v) => (v === '' ? null : Number(v) || 0))
      .filter((v) => v !== null)
    if (valeurs.length < 2) return { min: null, max: null }
    const min = Math.min(...valeurs)
    const max = Math.max(...valeurs)
    return min === max ? { min: null, max: null } : { min, max }
  }

  return (
    <>
      <h1 className="mb-1">🃏 Rami achète</h1>
      <p className="text-muted">
        Saisis les points de chaque joueur à chaque partie. Le plus petit total
        l'emporte.{' '}
        <span className="badge text-bg-primary">bleu</span> = partie gagnée ·{' '}
        <span className="badge text-bg-danger">rouge</span> = plus de points.
      </p>

      {/* --- Classement automatique --- */}
      {partieCommencee && (
        <div className="row row-cols-2 row-cols-md-auto g-2 mb-4">
          {classement.map((c) => (
            <div className="col" key={c.index}>
              <div className="card text-center h-100">
                <div className="card-body py-2 px-3">
                  <div className="fs-4">{medaille(c.rang)}</div>
                  <div className="fw-bold text-truncate">{c.nom}</div>
                  <div className="text-muted small">{c.total} pts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Grille des scores : contrat en bannière pleine largeur, une
          colonne par joueur, tout tient sans défilement horizontal. --- */}
      <table className="table table-bordered align-middle text-center mb-3 rami-grid">
        <thead className="table-dark">
          <tr>
            {joueurs.map((nom, j) => (
              <th key={j}>
                <input
                  className="form-control text-center name-input"
                  value={nom}
                  onChange={(e) => renommer(j, e.target.value)}
                  aria-label={`Nom du joueur ${j + 1}`}
                />
                {joueurs.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-light p-0 remove-x"
                    onClick={() => retirerJoueur(j)}
                    title="Retirer le joueur"
                  >
                    × retirer
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {CONTRATS.map((contrat, p) => {
            const { min, max } = statsPartie(p)
            return (
              <Fragment key={p}>
                <tr>
                  <td colSpan={joueurs.length} className="contrat-banner text-start">
                    <span className="fw-bold me-1">Partie {p + 1}.</span>
                    <span className="text-muted">{contrat}</span>
                  </td>
                </tr>
                <tr>
                  {joueurs.map((_, j) => {
                    const brut = scores[p]?.[j] ?? ''
                    const valeur = brut === '' ? null : Number(brut) || 0
                    let cls
                    if (valeur !== null && min !== null) {
                      if (valeur === min) cls = 'table-primary'
                      else if (valeur === max) cls = 'table-danger'
                    }
                    return (
                      <td key={j} className={cls}>
                        <input
                          type="number"
                          inputMode="numeric"
                          className="form-control text-center bg-transparent"
                          value={brut}
                          placeholder="—"
                          onChange={(e) => saisir(p, j, e.target.value)}
                        />
                      </td>
                    )
                  })}
                </tr>
              </Fragment>
            )
          })}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={joueurs.length} className="contrat-banner text-start fw-bold">
              Σ Total
            </td>
          </tr>
          <tr className="fw-bold fs-5">
            {totaux.map((total, j) => (
              <td key={j}>
                {total}
                <div className="fs-6 text-muted">{medaille(rangParJoueur[j])}</div>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>

      <div className="d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={ajouterJoueur}
        >
          + Ajouter un joueur
        </button>
        <button
          type="button"
          className="btn btn-outline-danger ms-auto"
          onClick={reinitialiser}
        >
          Réinitialiser
        </button>
      </div>
    </>
  )
}

function medaille(rang) {
  return { 1: '🥇', 2: '🥈', 3: '🥉' }[rang] ?? `${rang}ᵉ`
}
