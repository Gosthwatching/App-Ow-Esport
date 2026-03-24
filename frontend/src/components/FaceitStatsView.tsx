import type { FormEvent } from 'react'
import type { Team, TeamMapStatsEntry } from '../utils/types'

type FaceitStatsViewProps = {
  teams: Team[]
  selectedTeamId: string
  selectedMapFilter: string
  limit: string
  isLoading: boolean
  mapStats: TeamMapStatsEntry[]
  onTeamChange: (value: string) => void
  onMapFilterChange: (value: string) => void
  onLimitChange: (value: string) => void
  onLoadStats: (event: FormEvent) => Promise<void>
}

export function FaceitStatsView({
  teams,
  selectedTeamId,
  selectedMapFilter,
  limit,
  isLoading,
  mapStats,
  onTeamChange,
  onMapFilterChange,
  onLimitChange,
  onLoadStats,
}: FaceitStatsViewProps) {
  return (
    <section className="view-content">
      <h2>Stats FACEIT par map</h2>

      <form className="faceit-filter-form" onSubmit={onLoadStats}>
        <label>
          Team
          <select value={selectedTeamId} onChange={(event) => onTeamChange(event.target.value)} required>
            <option value="">Selectionner...</option>
            {teams.map((team) => (
              <option key={team.id} value={String(team.id)}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Map (optionnel)
          <input
            value={selectedMapFilter}
            onChange={(event) => onMapFilterChange(event.target.value)}
            placeholder="ex: ilios"
          />
        </label>

        <label>
          Matchs par joueur
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(event) => onLimitChange(event.target.value)}
            required
          />
        </label>

        <button type="submit" className="action-btn">
          Charger
        </button>
      </form>

      {isLoading ? <p className="hint">Chargement des stats FACEIT...</p> : null}

      {!isLoading && mapStats.length === 0 ? (
        <p className="hint">Aucune stats disponible pour cette selection.</p>
      ) : null}

      <div className="faceit-map-sections">
        {mapStats.map((entry) => (
          <article key={entry.map} className="faceit-map-card">
            <header>
              <h3>{entry.map}</h3>
            </header>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Joueur</th>
                    <th>Matchs</th>
                    <th>Wins</th>
                    <th>Kills</th>
                    <th>Deaths</th>
                    <th>Assists</th>
                    <th>KD</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.players.map((player) => (
                    <tr key={`${entry.map}-${player.faceitId}`}>
                      <td>{player.pseudo}</td>
                      <td>{player.matches}</td>
                      <td>{player.wins}</td>
                      <td>{player.kills}</td>
                      <td>{player.deaths}</td>
                      <td>{player.assists}</td>
                      <td>{player.kd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
