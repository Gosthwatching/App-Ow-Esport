const ROLE_RANK: Record<string, number> = {
  owner: 6,
  admin: 6,
  ceo: 5,
  manager_pole_ow: 4,
  manager: 3,
  coach: 3,
  joueur: 1,
  user: 1,
  player: 1,
}

export const ASSIGNABLE_ROLES = [
  'ceo',
  'manager_pole_ow',
  'manager',
  'coach',
  'joueur',
]

export function normalizeRole(role: string | undefined) {
  if (!role) {
    return 'joueur'
  }

  return role.toLowerCase()
}

export function roleLevel(role: string | undefined) {
  return ROLE_RANK[normalizeRole(role)] ?? 0
}

export function canAccess(actorRole: string | undefined, minimumRole: string) {
  return roleLevel(actorRole) >= roleLevel(minimumRole)
}

export function createInitials(name: string) {
  const words = name.trim().split(/\s+/)
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
