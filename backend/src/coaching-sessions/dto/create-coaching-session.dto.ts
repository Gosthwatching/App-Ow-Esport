import { IsInt, IsISO8601, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateCoachingSessionDto {
  @IsInt()
  teamId: number

  @IsInt()
  coachId: number

  @IsString()
  @MaxLength(255)
  topic: string

  @IsISO8601()
  scheduledAt: string

  @IsInt()
  @Min(1)
  duration: number

  @IsOptional()
  @IsString()
  notes?: string
}
