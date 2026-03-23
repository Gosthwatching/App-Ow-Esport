import type { FormEvent } from 'react'
import type { HeroPoolEntry } from '../utils/types'

type HeroesViewProps = {
  poolOwner: string
  pseudoInput: string
  isLoading: boolean
  poolEntries: HeroPoolEntry[]
  onPseudoInputChange: (value: string) => void
  onSearchByPseudo: (event: FormEvent) => Promise<void>
}

export function HeroesView({
  poolOwner,
  pseudoInput,
  isLoading,
  poolEntries,
  onPseudoInputChange,
  onSearchByPseudo,
}: HeroesViewProps) {
  const groupedByTier = poolEntries.reduce(
    (acc, hero) => {
      const key = hero.tier ?? 'Unranked'
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(hero)
      return acc
    },
    {} as Record<string, HeroPoolEntry[]>,
  )

  const tierOrder = ['S', 'A', 'B', 'C', 'D', 'Unranked']

  return (
    <section className="view-content">
      <h2>Pool de Héros</h2>
      <form className="pool-search" onSubmit={onSearchByPseudo}>
        <input
          placeholder="Entrez un pseudo"
          value={pseudoInput}
          onChange={(event) => onPseudoInputChange(event.target.value)}
        />
        <button type="submit" className="action-btn">
          Voir son pool
        </button>
      </form>

      <p className="pool-owner">Pool affiché: {poolOwner}</p>

      <div className="heroes-grid">
        {isLoading ? (
          <p className="hint">Chargement du pool...</p>
        ) : poolEntries.length === 0 ? (
          <p className="hint">Aucun héros dans ce pool.</p>
        ) : (
          tierOrder
            .filter((tier) => groupedByTier[tier]?.length)
            .map((tier) => (
            <div key={tier}>
              <h3>{tier}</h3>
              <div className="role-heroes">
                {groupedByTier[tier].map((hero) => (
                  <div key={hero.id} className="hero-badge">
                    {hero.name}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
