type BottomCardsProps = {
  playerRatio: number
}

export function BottomCards({ playerRatio }: BottomCardsProps) {
  return (
    <section className="bottom-cards">
      <article className="content-card">
        <h4>Focus recrutement</h4>
        <p>Distribution joueurs avec team: {playerRatio}%</p>
        <div className="progress-track">
          <div style={{ width: `${playerRatio}%` }} />
        </div>
      </article>
      <article className="content-card">
        <h4>Roles du roster</h4>
        <ul>
          <li>Tank/DPS/Support sync via backend players</li>
          <li>RBAC hierarchique actif cote API</li>
          <li>Actions UI filtrees selon ton niveau</li>
        </ul>
      </article>
    </section>
  )
}
