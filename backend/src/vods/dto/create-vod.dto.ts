export class CreateVODDto {
  createdBy: number
  title: string
  description?: string
  team1Name?: string
  team2Name?: string
  team1Score?: number
  team2Score?: number
  mapName?: string
  vodUrl: string
  duration?: number
}
