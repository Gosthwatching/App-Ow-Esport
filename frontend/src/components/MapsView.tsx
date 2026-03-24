import { useState } from 'react'
import type { FormEvent } from 'react'
import type { MapPoolEntry } from '../utils/types'
import { getMapVisual } from '../utils/map-visuals'

const MAP_TYPES = ['All', 'Control', 'Escort', 'Hybrid', 'Push', 'Flashpoint'] as const

type MapsViewProps = {
  poolOwner: string
  pseudoInput: string
  isLoading: boolean
  poolEntries: MapPoolEntry[]
  isOwnPool: boolean
  onPseudoInputChange: (value: string) => void
  onSearchByPseudo: (event: FormEvent) => Promise<void>
  onToggleMap: (mapId: number, currentlyInPool: boolean) => Promise<void>
}

export function MapsView({
  poolOwner,
  pseudoInput,
  isLoading,
  poolEntries,
  isOwnPool,
  onPseudoInputChange,
  onSearchByPseudo,
  onToggleMap,
}: MapsViewProps) {
  const [typeFilter, setTypeFilter] = useState<(typeof MAP_TYPES)[number]>('All')

  const filtered =
    typeFilter === 'All' ? poolEntries : poolEntries.filter((map) => map.type === typeFilter)

  const inPool = filtered.filter((map) => map.in_pool)
  const outOfPool = filtered.filter((map) => !map.in_pool)

  const typeLabel: Record<string, string> = {
    Control: 'Control',
    Escort: 'Escort',
    Hybrid: 'Hybrid',
    Push: 'Push',
    Flashpoint: 'Flashpoint',
  }

  return (
    <section className="view-content">
      <div className="heroes-header">
        <h2>Map Pool — {poolOwner}</h2>
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
        {MAP_TYPES.map((type) => (
          <button
            key={type}
            className={`role-tab${typeFilter === type ? ' active' : ''}`}
            onClick={() => setTypeFilter(type)}
          >
            {type === 'All' ? 'Toutes' : typeLabel[type]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="hint">Chargement du map pool...</p>
      ) : (
        <>
          {inPool.length > 0 && (
            <div className="pool-section">
              <h3 className="pool-section-title">Pool actif ({inPool.length})</h3>
              <div className="heroes-pool-grid maps-pool-grid">
                {inPool.map((map) => (
                  <MapTile
                    key={map.id}
                    map={map}
                    editable={isOwnPool}
                    onToggle={onToggleMap}
                  />
                ))}
              </div>
            </div>
          )}

          {(isOwnPool || inPool.length === 0) && outOfPool.length > 0 && (
            <div className="pool-section">
              <h3 className="pool-section-title">
                {isOwnPool ? 'Disponible pour ajout' : 'Hors pool'}
              </h3>
              <div className="heroes-pool-grid maps-pool-grid unranked">
                {outOfPool.map((map) => (
                  <MapTile
                    key={map.id}
                    map={map}
                    editable={isOwnPool}
                    onToggle={onToggleMap}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && <p className="hint">Aucune map trouvée.</p>}
        </>
      )}
    </section>
  )
}

type MapTileProps = {
  map: MapPoolEntry
  editable: boolean
  onToggle: (mapId: number, currentlyInPool: boolean) => Promise<void>
}

function MapTile({ map, editable, onToggle }: MapTileProps) {
  const [saving, setSaving] = useState(false)
  const visual = getMapVisual(map.code, map.name, map.type)

  async function handleClick() {
    if (!editable || saving) return
    setSaving(true)
    try {
      await onToggle(map.id, map.in_pool)
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      type="button"
      className={`map-tile${map.in_pool ? ' map-tile--selected' : ''}`}
      onClick={() => void handleClick()}
      disabled={!editable || saving}
      title={editable ? (map.in_pool ? 'Retirer du pool' : 'Ajouter au pool') : undefined}
    >
      <div
        className="map-tile__visual"
        style={{
          backgroundImage: map.image_url ? `linear-gradient(180deg, rgba(8, 12, 24, 0.08), rgba(8, 12, 24, 0.62)), url(${map.image_url})` : visual.background,
          boxShadow: `inset 0 0 0 1px ${visual.glow}`,
        }}
      >
        <div className="map-tile__overlay" />
        <div className="map-tile__header">
          <span className="map-tile__type" style={{ borderColor: visual.glow, color: visual.accent }}>
            {map.type}
          </span>
          <span className="map-tile__code">{visual.shortCode}</span>
        </div>
        <div className="map-tile__footer">
          <strong>{map.name}</strong>
          <span>{visual.subtitle}</span>
        </div>
      </div>

      <div className="map-tile__meta">
        <span className="map-tile__status" style={{ color: visual.accent }}>
          {map.in_pool ? 'Dans ton pool' : editable ? 'Cliquer pour ajouter' : 'Non sélectionnée'}
        </span>
        {map.in_pool ? (
          <span className="map-tile__check" style={{ background: visual.accent }}>
            ✓
          </span>
        ) : null}
      </div>
    </button>
  )
}
