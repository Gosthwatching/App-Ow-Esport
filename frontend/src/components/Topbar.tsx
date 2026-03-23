import { createInitials, normalizeRole } from '../utils/auth'
import type { User } from '../utils/types'

type TopbarProps = {
  user: User
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="topbar">
      <input placeholder="Search teams, players, heroes" />
      <div className="topbar-user">
        <span className="role-pill">{normalizeRole(user.role)}</span>
        <div className="avatar-chip">{createInitials(user.displayName || user.username)}</div>
      </div>
    </header>
  )
}
