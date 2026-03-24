import type { Player } from '../utils/types'

type PlayersViewProps = {
  players: Player[]
  onViewProfile: (pseudo: string) => void
}

export function PlayersView({ players, onViewProfile }: PlayersViewProps) {
  return (
    <section className="view-content">
      <h2>Gestion des Joueurs</h2>
      <div className="players-grid">
        {players.length === 0 ? (
          <p className="hint">Aucun joueur enregistré.</p>
        ) : (
          players.map((player) => (
            <div key={player.id} className="player-card">
              <div className="player-avatar">{player.pseudo[0]?.toUpperCase()}</div>
              <h4>{player.pseudo}</h4>
              <p className="role-badge">{player.role}</p>
              {player.rank ? <p className="rank-badge">{player.rank}</p> : null}

              {player.faceit_elo ? (
                <div className="faceit-info">
                  <span className="faceit-label">FACEIT</span>
                  <span className="faceit-elo">{player.faceit_elo} ELO</span>
                  {player.faceit_level ? (
                    <span className="faceit-level">Niv.&nbsp;{player.faceit_level}</span>
                  ) : null}
                </div>
              ) : (
                <p className="faceit-missing">Faceit non lié</p>
              )}

              {(player.teamId ?? player.team_id) ? (
                <p className="team-info">Équipe assignée</p>
              ) : (
                <p className="unassigned">Non assigné</p>
              )}
              <button className="action-btn" onClick={() => onViewProfile(player.pseudo)}>
                Voir pool de héros
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
