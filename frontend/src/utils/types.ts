export type User = {
  id: number
  username: string
  displayName?: string | null
  role: string
  faceitNickname?: string | null
}

export type Team = {
  id: number
  name: string
  elo: number
  slug?: string | null
}

export type Player = {
  id: number
  pseudo: string
  role: string
  teamId?: number | null
  team_id?: number | null
  userId?: number | null
  user_id?: number | null
  rank?: string | null
  faceit_elo?: number | null
  faceit_level?: number | null
  faceit_id?: string | null
}

export type Hero = {
  id: number
  name: string
  role: string
}

export type HeroPoolEntry = {
  id: number
  name: string
  role: string
  code?: string | null
  image_url?: string | null
  tier?: string | null
}

export type HeroPoolByPseudoResponse = {
  userId: number
  username: string
  displayName?: string | null
  heroes: HeroPoolEntry[]
}

export type AuthForm = {
  username: string
  password: string
  displayName: string
  faceitNickname: string
}

export type Team_creation = {
  name: string
  elo: number
}

export type TeamMapPlayerStats = {
  playerId: number
  pseudo: string
  faceitId: string
  matches: number
  wins: number
  kills: number
  deaths: number
  assists: number
  kd: number
}

export type TeamMapStatsEntry = {
  map: string
  players: TeamMapPlayerStats[]
}

export type TeamFaceitMapStatsResponse = {
  team: {
    id: number
    name: string
    slug?: string | null
  }
  mapStats: TeamMapStatsEntry[]
  totalMaps: number
}
