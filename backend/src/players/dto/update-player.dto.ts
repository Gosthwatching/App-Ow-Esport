import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

const ranks = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Master',
  'Grandmaster',
  'Top500',
] as const;

const roles = ['Tank', 'DPS', 'Support'] as const;

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  pseudo?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @IsIn(roles)
  role?: (typeof roles)[number];

  @IsOptional()
  @IsIn(ranks)
  rank?: (typeof ranks)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  teamId?: number;
}