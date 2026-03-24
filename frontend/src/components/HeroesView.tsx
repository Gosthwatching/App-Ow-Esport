import { useState } from 'react'
import type { FormEvent } from 'react'
import type { HeroPoolEntry } from '../utils/types'

const TIERS = ['S', 'A', 'B', 'C', 'D'] as const
const ROLES = ['All', 'Tank', 'DPS', 'Support'] as const

type HeroesViewProps = {
  poolOwner: string
  pseudoInput: string
  isLoading: boolean
  poolEntries: HeroPoolEntry[]
  isOwnPool: boolean
  myPlayerRole?: string | null
  onPseudoInputChange: (value: string) => void
  onSearchByPseudo: (event: FormEvent) => Promise<void>
  onSetTier: (heroId: number, tier: string) => Promise<void>
  onRemoveTier: (heroId: number) => Promise<void>
}

export function HeroesView({
  poolOwner,
  pseudoInput,
  isLoading,
  poolEntries,
  isOwnPool,
  myPlayerRole,
  onPseudoInputChange,
  onSearchByPseudo,
  onSetTier,
  onRemoveTier,
}: HeroesViewProps) {
  const defaultRole =
    myPlayerRole && ROLES.includes(myPlayerRole as (typeof ROLES)[number])
      ? (myPlayerRole as (typeof ROLES)[number])
      : 'All'

  const [roleFilter, setRoleFilter] = useState<(typeof ROLES)[number]>(
    isOwnPool ? defaultRole : 'All',
  )

  const filtered = roleFilter === 'All' ? poolEntries : poolEntries.filter((h) => h.role === roleFilter)
  const tiered = filtered.filter((h) => h.tier)
  const unranked = filtered.filter((h) => !h.tier)

  const roleLabel: Record<string, string> = {
    Tank: '🛡️ Tank',
    DPS: '⚔️ DPS',
    Support: '💚 Support',
  }

  return (
    <section className="view-content">
      <div className="heroes-header">
        <h2>Pool de Héros — {poolOwner}</h2>
        <form className="pool-search" onSubmit={onSearchByPseudo}>
          <input
            placeholder="Rechercher un autre joueur..."
            value={pseudoInput}
            onChange={(event) => onPseudoInputChange(event.target.value)}
          />
          <button type="submit" className="action-btn">
            Voir
          </button>
        </form>
      </div>

      <div className="role-tabs">
        {ROLES.map((r) => (
          <button
            key={r}
            className={`role-tab${roleFilter === r ? ' active' : ''}`}
            onClick={() => setRoleFilter(r)}
          >
            {r === 'All' ? '🎮 Tous' : roleLabel[r]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="hint">Chargement du pool...</p>
      ) : (
        <>
          {tiered.length > 0 && (
            <div className="pool-section">
              <h3 className="pool-section-title">Mon pool</h3>
              <div className="heroes-pool-grid">
                {tiered.map((hero) => (
                  <HeroTile
                    key={hero.id}
                    hero={hero}
                    editable={isOwnPool}
                    onSetTier={onSetTier}
                    onRemoveTier={onRemoveTier}
                  />
                ))}
              </div>
            </div>
          )}

          {(isOwnPool || tiered.length === 0) && unranked.length > 0 && (
            <div className="pool-section">
              <h3 className="pool-section-title">
                {isOwnPool ? 'Ajouter au pool' : 'Non classés'}
              </h3>
              <div className="heroes-pool-grid unranked">
                {unranked.map((hero) => (
                  <HeroTile
                    key={hero.id}
                    hero={hero}
                    editable={isOwnPool}
                    onSetTier={onSetTier}
                    onRemoveTier={onRemoveTier}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && <p className="hint">Aucun héros trouvé.</p>}
        </>
      )}
    </section>
  )
}

type HeroTileProps = {
  hero: HeroPoolEntry
  editable: boolean
  onSetTier: (heroId: number, tier: string) => Promise<void>
  onRemoveTier: (heroId: number) => Promise<void>
}

const TIER_COLORS: Record<string, string> = {
  S: '#ff6b35',
  A: '#ff9f43',
  B: '#ffd32a',
  C: '#0be881',
  D: '#4bcffa',
}

function HeroTile({ hero, editable, onSetTier, onRemoveTier }: HeroTileProps) {
  const [saving, setSaving] = useState(false)

  async function handleTier(tier: string) {
    if (!editable || saving) return
    setSaving(true)
    try {
      if (hero.tier === tier) {
        await onRemoveTier(hero.id)
      } else {
        await onSetTier(hero.id, tier)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`hero-tile${hero.tier ? ' hero-tile--tiered' : ''}`}>
      <div
        className="hero-tile-tier-bar"
        style={{ background: hero.tier ? TIER_COLORS[hero.tier] : 'transparent' }}
      />
      <div className="hero-tile-name">{hero.name}</div>
      <div className="hero-tile-role-label">{hero.role}</div>

      {editable ? (
        <div className="hero-tier-btns">
          {TIERS.map((t) => (
            <button
              key={t}
              className={`tier-btn tier-btn--${t}${hero.tier === t ? ' active' : ''}`}
              onClick={() => void handleTier(t)}
              disabled={saving}
            >
              {t}
            </button>
          ))}
          {hero.tier ? (
            <button
              className="tier-btn tier-btn--remove"
              onClick={() =>
                void (async () => {
                  if (saving) return
                  setSaving(true)
                  try {
                    await onRemoveTier(hero.id)
                  } finally {
                    setSaving(false)
                  }
                })()
              }
              disabled={saving}
            >
              ×
            </button>
          ) : null}
        </div>
      ) : null}

      {!editable && hero.tier ? (
        <div className="hero-tier-badge" style={{ background: TIER_COLORS[hero.tier] }}>
          {hero.tier}
        </div>
      ) : null}
    </div>
  )
}
