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

export type MapPoolEntry = {
  id: number
  name: string
  type: string
  code?: string | null
  image_url?: string | null
  in_pool: boolean
}

export type MapPoolByPseudoResponse = {
  userId: number
  username: string
  displayName?: string | null
  maps: MapPoolEntry[]
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

export type Scrim = {
  id: number
  team1_name?: string | null
  team2_name?: string | null
  details?: {
    sessionType?: 'scrim' | 'official'
    opponentTeamName?: string
    opponentRoster?: string
    language?: 'FR' | 'EN'
    lobbyCreation?: 'eu' | 'us' | 'them'
    twoHourBlock?: boolean
    stagger?: boolean
    ban?: boolean
    mapPool?: string
    mapPoolType?: 'faceit' | 'afo' | 'custom'
    customMaps?: string[]
    sessionSlot?: string
  } | null
  teamAId?: number | null
  team1_id?: number | null
  teamBId?: number | null
  team2_id?: number | null
  mapId?: number | null
  map_id?: number | null
  winnerTeamId?: number | null
  winner_team_id?: number | null
  scoreA?: number | null
  score1?: number | null
  scoreB?: number | null
  score2?: number | null
  duration?: number | null
  scheduledAt?: string | null
  scheduled_at?: string | null
  playedAt?: string | null
  played_at?: string | null
  createdBy?: number | null
  created_by?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type CoachingSession = {
  id: number
  teamId: number
  coachId: number
  topic: string
  focusAreas: string[]
  playersFocused?: number[]
  scheduledAt: string
  duration: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Training = {
  id: number
  createdBy: number
  title: string
  description: string
  category: 'general' | 'tank' | 'dps' | 'support' | 'strategy'
  content: string
  videoUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type Absence = {
  id: number
  playerId: number
  teamId: number
  startDate: string
  endDate: string
  reason?: string
  approvedBy?: number | null
  createdAt: string
  updatedAt: string
}

export type VOD = {
  id: number
  scrimId?: number | null
  createdBy: number
  title: string
  description?: string | null
  team1Name?: string | null
  team2Name?: string | null
  team1Score?: number | null
  team2Score?: number | null
  mapName?: string | null
  vodUrl: string
  duration?: number | null
  taggedPlayers?: number[]
  createdAt: string
  updatedAt: string
}
