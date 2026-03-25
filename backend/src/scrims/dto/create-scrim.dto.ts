import { IsArray, IsInt, IsISO8601, IsObject, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class CreateScrimDto {
  @ValidateIf((o) => o.opponentTeamId === undefined && !o.opponentTeamName)
  @IsInt()
  @Min(1)
  team1Id: number;

  @ValidateIf((o) => o.opponentTeamId === undefined && !o.opponentTeamName)
  @IsInt()
  @Min(1)
  team2Id: number;

  @IsOptional()
  @IsISO8601()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  format: string;

  @IsOptional()
  @IsArray()
  maps: { mapId: number; order: number }[];

  // Simplified payload for manager/coach: backend infers team1 from authenticated user.
  @IsOptional()
  @IsInt()
  @Min(1)
  opponentTeamId?: number;

  @IsOptional()
  @IsString()
  opponentTeamName?: string;

  @IsOptional()
  @IsString()
  opponentRoster?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}