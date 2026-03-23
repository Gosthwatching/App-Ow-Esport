import type { FormEvent } from 'react'
import { ASSIGNABLE_ROLES } from '../utils/auth'

type RoleControlFormProps = {
  canManageRoles: boolean
  roleTargetId: string
  newRole: string
  onTargetIdChange: (value: string) => void
  onRoleChange: (value: string) => void
  onSubmit: (e: FormEvent) => Promise<void>
}

export function RoleControlForm({
  canManageRoles,
  roleTargetId,
  newRole,
  onTargetIdChange,
  onRoleChange,
  onSubmit,
}: RoleControlFormProps) {
  return (
    <section className="list-card">
      <h4>Role control</h4>
      {canManageRoles ? (
        <form className="role-form" onSubmit={onSubmit}>
          <input
            placeholder="User ID"
            type="number"
            min={1}
            value={roleTargetId}
            onChange={(e) => onTargetIdChange(e.target.value)}
            required
          />
          <select value={newRole} onChange={(e) => onRoleChange(e.target.value)}>
            {ASSIGNABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="submit" className="primary-btn">
            Changer le role
          </button>
        </form>
      ) : (
        <p className="hint">Gestion des roles reservee a coach et plus.</p>
      )}
    </section>
  )
}
