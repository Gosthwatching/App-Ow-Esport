type MetricsGridProps = {
  teamsCount: number
  playersCount: number
  playersWithTeam: number
  heroesCount: number
}

export function MetricsGrid({
  teamsCount,
  playersCount,
  playersWithTeam,
  heroesCount,
}: MetricsGridProps) {
  return (
    <section className="metrics-grid">
      <article className="metric-card">
        <p>Teams</p>
        <h3>{teamsCount}</h3>
        <span>Actives dans ton ecosysteme</span>
      </article>
      <article className="metric-card">
        <p>Players</p>
        <h3>{playersCount}</h3>
        <span>{playersWithTeam} assignes a une team</span>
      </article>
      <article className="metric-card">
        <p>Hero pool</p>
        <h3>{heroesCount}</h3>
        <span>Meta monitor live</span>
      </article>
    </section>
  )
}
