import type { Team } from '../utils/types'

type TeamsListProps = {
  teams: Team[]
}

export function TeamsList({ teams }: TeamsListProps) {
  return (
    <section className="list-card">
      <h4>Top teams by ELO</h4>
      {teams.map((team) => (
        <div key={team.id} className="list-item">
          <div>
            <p>{team.name}</p>
            <span>ELO {team.elo}</span>
          </div>
          <button>Open</button>
        </div>
      ))}
      {teams.length === 0 ? <p className="hint">Aucune team pour le moment.</p> : null}
    </section>
  )
}
