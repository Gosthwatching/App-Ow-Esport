export type User = {
  id: number
  username: string
  displayName?: string | null
  role: string
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
}

export type Team_creation = {
  name: string
  elo: number
}
