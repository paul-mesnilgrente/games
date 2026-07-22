import { Fragment, useMemo } from 'react'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

export const meta = {
  title: 'Yahtzee',
  description: 'Grille de score solo, avec plusieurs parties et totaux automatiques.',
  icon: '🎲',
}

// ---------------------------------------------------------------------------
//  Catégories de la grille de Yahtzee. `hint` = aide de saisie,
//  `fixed` = valeur fixe attendue (affichée en placeholder).
// ---------------------------------------------------------------------------
const SUPERIEUR = [
  { key: 'un', label: 'As', hint: 'total des 1' },
  { key: 'deux', label: 'Deux', hint: 'total des 2' },
  { key: 'trois', label: 'Trois', hint: 'total des 3' },
  { key: 'quatre', label: 'Quatre', hint: 'total des 4' },
  { key: 'cinq', label: 'Cinq', hint: 'total des 5' },
  { key: 'six', label: 'Six', hint: 'total des 6' },
]

const INFERIEUR = [
  { key: 'brelan', label: 'Brelan', hint: 'somme des dés' },
  { key: 'carre', label: 'Carré', hint: 'somme des dés' },
  { key: 'full', label: 'Full', fixed: 25 },
  { key: 'petiteSuite', label: 'Petite suite', fixed: 30 },
  { key: 'grandeSuite', label: 'Grande suite', fixed: 40 },
  { key: 'yahtzee', label: 'Yahtzee', fixed: 50 },
  { key: 'chance', label: 'Chance', hint: 'somme des dés' },
]

const CATEGORIES = [...SUPERIEUR, ...INFERIEUR]
const NB_SUP = SUPERIEUR.length
const SEUIL_BONUS = 63
const BONUS = 35

export default function Yahtzee() {
  const [manches, setManches] = useLocalStorage('yahtzee:manches', ['Partie 1'])
  // scores[categorie][manche] = chaîne saisie ('' = vide)
  const [scores, setScores] = useLocalStorage('yahtzee:scores', () =>
    CATEGORIES.map(() => ['']),
  )

  const val = (c, m) => Number(scores[c]?.[m]) || 0

  // --- Totaux automatiques par manche ------------------------------------
  const calc = useMemo(
    () =>
      manches.map((_, m) => {
        let sup = 0
        for (let c = 0; c < NB_SUP; c++) sup += val(c, m)
        let inf = 0
        for (let c = NB_SUP; c < CATEGORIES.length; c++) inf += val(c, m)
        const bonus = sup >= SEUIL_BONUS ? BONUS : 0
        return { sup, bonus, inf, total: sup + bonus + inf }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manches, scores],
  )

  const meilleurTotal = useMemo(() => {
    const totaux = calc.map((c) => c.total)
    const max = Math.max(...totaux, 0)
    return max > 0 ? max : null
  }, [calc])

  // --- Actions ------------------------------------------------------------
  function renommer(m, nom) {
    setManches((prev) => prev.map((n, i) => (i === m ? nom : n)))
  }

  function saisir(c, m, valeur) {
    setScores((prev) =>
      prev.map((ligne, i) =>
        i === c ? ligne.map((v, j) => (j === m ? valeur : v)) : ligne,
      ),
    )
  }

  function ajouterManche() {
    setManches((prev) => [...prev, `Partie ${prev.length + 1}`])
    setScores((prev) => prev.map((ligne) => [...ligne, '']))
  }

  function retirerManche(m) {
    if (manches.length <= 1) return
    setManches((prev) => prev.filter((_, i) => i !== m))
    setScores((prev) => prev.map((ligne) => ligne.filter((_, i) => i !== m)))
  }

  function reinitialiser() {
    setScores(CATEGORIES.map(() => manches.map(() => '')))
  }

  // Ligne calculée (sous-total, bonus, total) réutilisable.
  const ligneCalcul = (libelle, valeurs, opts = {}) => (
    <tr className={opts.fort ? 'fw-bold fs-5' : 'fw-semibold'}>
      <td className="score-label score-label-wide text-start">{libelle}</td>
      {valeurs.map((v, m) => (
        <td
          key={m}
          className={
            opts.meilleur && meilleurTotal != null && v === meilleurTotal
              ? 'table-success'
              : undefined
          }
        >
          {v}
          {opts.meilleur && meilleurTotal != null && v === meilleurTotal && ' 👑'}
        </td>
      ))}
    </tr>
  )

  return (
    <>
      <h1 className="mb-1">🎲 Yahtzee</h1>
      <p className="text-soft">
        Grille solo : une colonne par partie. Les totaux, le bonus (+{BONUS} si
        la section haute atteint {SEUIL_BONUS}) et le total général se calculent
        tout seuls.
      </p>

      {/* Ajout d'une partie, au-dessus de la grille. */}
      <div className="d-flex mb-2">
        <button
          type="button"
          className="btn btn-felt-outline btn-sm"
          onClick={ajouterManche}
        >
          + Ajouter une partie
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center mb-3 score-table">
          <thead className="table-dark">
            <tr>
              <th className="score-label score-label-wide text-start">Catégorie</th>
              {manches.map((nom, m) => (
                <th key={m}>
                  <div className="d-flex align-items-center gap-1">
                    <input
                      className="form-control text-center name-input"
                      value={nom}
                      onChange={(e) => renommer(m, e.target.value)}
                      aria-label={`Nom de la partie ${m + 1}`}
                    />
                    {manches.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-light p-0 remove-x"
                        onClick={() => retirerManche(m)}
                        title="Retirer la partie"
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
            {CATEGORIES.map((cat, c) => (
              <Fragment key={cat.key}>
                {/* Séparateur avant la section inférieure. */}
                {c === NB_SUP &&
                  ligneCalcul(
                    'Total supérieur',
                    calc.map((x) => x.sup),
                  )}
                {c === NB_SUP &&
                  ligneCalcul(
                    `Bonus (≥ ${SEUIL_BONUS})`,
                    calc.map((x) => x.bonus),
                  )}
                <tr>
                  <td className="score-label score-label-wide text-start">
                    <span className="fw-semibold">{cat.label}</span>
                    {(cat.hint || cat.fixed != null) && (
                      <span className="text-muted small ms-1">
                        · {cat.hint ?? `${cat.fixed} pts`}
                      </span>
                    )}
                  </td>
                  {manches.map((_, m) => (
                    <td key={m}>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="form-control text-center bg-transparent"
                        value={scores[c]?.[m] ?? ''}
                        placeholder="—"
                        onChange={(e) => saisir(c, m, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>

          <tfoot>
            {ligneCalcul(
              'Total général',
              calc.map((x) => x.total),
              { fort: true, meilleur: true },
            )}
          </tfoot>
        </table>
      </div>

      <div className="d-flex flex-wrap gap-2">
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
