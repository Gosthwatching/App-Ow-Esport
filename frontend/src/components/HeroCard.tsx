import type { FormEvent } from 'react'
import type { User } from '../utils/types'

type HeroCardProps = {
  user: User
  canCreateTeams: boolean
  newTeamName: string
  newTeamElo: string
  onTeamNameChange: (value: string) => void
  onTeamEloChange: (value: string) => void
  onCreateTeam: (e: FormEvent) => Promise<void>
}

export function HeroCard({
  user,
  canCreateTeams,
  newTeamName,
  newTeamElo,
  onTeamNameChange,
  onTeamEloChange,
  onCreateTeam,
}: HeroCardProps) {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">Control Center</p>
        <h2>
          Salut {user.displayName || user.username},
          <br />
          ton hub OW est pret.
        </h2>
        <p className="muted">Visualise les equipes, gere les roles et lance des actions securisees.</p>
        {canCreateTeams ? (
          <form className="inline-form" onSubmit={onCreateTeam}>
            <input
              placeholder="Nom de team"
              value={newTeamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              required
            />
            <input
              type="number"
              min={1}
              value={newTeamElo}
              onChange={(e) => onTeamEloChange(e.target.value)}
              required
            />
            <button type="submit" className="primary-btn">
              Creer team
            </button>
          </form>
        ) : (
          <p className="hint">Creation de team reservee au role owner.</p>
        )}
      </div>
      <div className="hero-illustration" aria-hidden="true">
        <div className="ring ring-a" />
        <div className="ring ring-b" />
        <div className="orb" />
      </div>
    </section>
  )
}
