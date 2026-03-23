export const CANONICAL_ROLES = [
  'owner',
  'ceo',
  'manager_pole_ow',
  'manager',
  'coach',
  'joueur',
] as const;

export type CanonicalRole = (typeof CANONICAL_ROLES)[number];

const ROLE_ALIASES: Record<string, CanonicalRole> = {
  owner: 'owner',
  ceo: 'ceo',
  manager_pole_ow: 'manager_pole_ow',
  manager: 'manager',
  coach: 'coach',
  joueur: 'joueur',
  player: 'joueur',
  user: 'joueur',
  admin: 'owner',
};

const ROLE_LEVEL: Record<CanonicalRole, number> = {
  owner: 6,
  ceo: 5,
  manager_pole_ow: 4,
  manager: 3,
  coach: 3,
  joueur: 1,
};

export function normalizeRole(role: string | undefined | null): CanonicalRole | null {
  if (!role) {
    return null;
  }

  return ROLE_ALIASES[role.toLowerCase()] ?? null;
}

export function getRoleLevel(role: string | undefined | null): number {
  const normalized = normalizeRole(role);

  if (!normalized) {
    return 0;
  }

  return ROLE_LEVEL[normalized];
}

export function hasRequiredRole(
  userRole: string | undefined | null,
  requiredRoles: string[] | undefined,
): boolean {
  if (!requiredRoles?.length) {
    return true;
  }

  const userLevel = getRoleLevel(userRole);

  if (userLevel === 0) {
    return false;
  }

  return requiredRoles.some((required) => userLevel >= getRoleLevel(required));
}

export function canAssignRole(
  actorRole: string | undefined | null,
  targetCurrentRole: string | undefined | null,
  targetNewRole: string | undefined | null,
): boolean {
  const actorLevel = getRoleLevel(actorRole);
  const targetCurrentLevel = getRoleLevel(targetCurrentRole);
  const targetNewLevel = getRoleLevel(targetNewRole);

  if (actorLevel === 0 || targetNewLevel === 0) {
    return false;
  }

  return actorLevel > targetCurrentLevel && actorLevel > targetNewLevel;
}
