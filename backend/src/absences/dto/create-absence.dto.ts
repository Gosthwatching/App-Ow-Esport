export class CreateAbsenceDto {
  playerId: number
  teamId?: number
  startDate: string
  endDate: string
  reason?: string
}
