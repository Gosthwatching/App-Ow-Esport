import type { FormEvent } from 'react'
import type { Player, Team } from '../utils/types'

type TeamsViewProps = {
  teams: Team[]
  canManageTeams: boolean
  canFillTeams: boolean
  selectedTeam: Team | null
  selectedTeamPlayers: Player[]
  isLoading: boolean
  teamEditName: string
  teamEditElo: string
  fillNames: string
  fillRole: string
  fillRank: string
  onLoadTeamDetails: (teamIdentifier: string) => Promise<void>
  onTeamEditNameChange: (value: string) => void
  onTeamEditEloChange: (value: string) => void
  onFillNamesChange: (value: string) => void
  onFillRoleChange: (value: string) => void
  onFillRankChange: (value: string) => void
  onUpdateSelectedTeam: (event: FormEvent) => Promise<void>
  onFillSelectedTeam: (event: FormEvent) => Promise<void>
  onDeleteTeam: (teamIdentifier: string) => Promise<void>
}

export function TeamsView({
  teams,
  canManageTeams,
  canFillTeams,
  selectedTeam,
  selectedTeamPlayers,
  isLoading,
  teamEditName,
  teamEditElo,
  fillNames,
  fillRole,
  fillRank,
  onLoadTeamDetails,
  onTeamEditNameChange,
  onTeamEditEloChange,
  onFillNamesChange,
  onFillRoleChange,
  onFillRankChange,
  onUpdateSelectedTeam,
  onFillSelectedTeam,
  onDeleteTeam,
}: TeamsViewProps) {
  return (
    <section className="view-content">
      <h2>Gestion des Equipes</h2>
      <div className="teams-table">
        {teams.length === 0 ? (
          <p className="hint">Aucune équipe créée pour le moment.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>ELO</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td>{team.name}</td>
                    <td>{team.elo}</td>
                    <td>
                      <button className="action-btn" onClick={() => void onLoadTeamDetails(String(team.id))}>
                        Details
                      </button>
                      {canManageTeams ? (
                        <button
                          className="action-btn danger-btn"
                          onClick={() => void onDeleteTeam(String(team.id))}
                        >
                          Supprimer
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <section className="team-detail-panel">
        <h3>Details de la team</h3>

        {isLoading ? <p className="hint">Chargement des details...</p> : null}

        {!isLoading && !selectedTeam ? (
          <p className="hint">Selectionne une team puis clique sur Details.</p>
        ) : null}

        {!isLoading && selectedTeam ? (
          <>
            <div className="team-meta-grid">
              <div>
                <small>ID</small>
                <p>{selectedTeam.id}</p>
              </div>
              <div>
                <small>Nom</small>
                <p>{selectedTeam.name}</p>
              </div>
              <div>
                <small>Slug</small>
                <p>{selectedTeam.slug ?? '-'}</p>
              </div>
              <div>
                <small>ELO</small>
                <p>{selectedTeam.elo}</p>
              </div>
            </div>

            <div className="team-player-list">
              <h4>Joueurs</h4>
              {selectedTeamPlayers.length === 0 ? (
                <p className="hint">Aucun joueur assigne a cette team.</p>
              ) : (
                <ul>
                  {selectedTeamPlayers.map((player) => (
                    <li key={player.id}>
                      {player.pseudo} - {player.role}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {canManageTeams ? (
              <form className="team-edit-form" onSubmit={onUpdateSelectedTeam}>
                <h4>Modifier la team</h4>
                <label>
                  Nom
                  <input
                    value={teamEditName}
                    onChange={(event) => onTeamEditNameChange(event.target.value)}
                    required
                  />
                </label>
                <label>
                  ELO
                  <input
                    type="number"
                    min={1}
                    value={teamEditElo}
                    onChange={(event) => onTeamEditEloChange(event.target.value)}
                    required
                  />
                </label>
                <button type="submit" className="action-btn">
                  Enregistrer
                </button>
              </form>
            ) : (
              <p className="hint">Modification reservee aux roles admin/owner.</p>
            )}

            {canFillTeams ? (
              <form className="team-fill-form" onSubmit={onFillSelectedTeam}>
                <h4>Remplir la team (owner/ceo/manager/coach)</h4>
                <label>
                  Noms des joueurs (separes par virgule)
                  <textarea
                    value={fillNames}
                    onChange={(event) => onFillNamesChange(event.target.value)}
                    placeholder="Pseudo1, Pseudo2, Pseudo3"
                    rows={3}
                    required
                  />
                </label>
                <label>
                  Role OW
                  <select value={fillRole} onChange={(event) => onFillRoleChange(event.target.value)}>
                    <option value="Tank">Tank</option>
                    <option value="DPS">DPS</option>
                    <option value="Support">Support</option>
                  </select>
                </label>
                <label>
                  Rank
                  <select value={fillRank} onChange={(event) => onFillRankChange(event.target.value)}>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Master">Master</option>
                    <option value="Grandmaster">Grandmaster</option>
                    <option value="Top500">Top500</option>
                  </select>
                </label>
                <button type="submit" className="action-btn">
                  Ajouter/Assigner
                </button>
              </form>
            ) : null}
          </>
        ) : null}
      </section>
    </section>
  )
}
