import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const roles = ['Tank', 'DPS', 'Support'] as const;
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

export class FillTeamPlayersDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(50, { each: true })
  names: string[];

  @IsOptional()
  @IsIn(roles)
  role?: (typeof roles)[number];

  @IsOptional()
  @IsIn(ranks)
  rank?: (typeof ranks)[number];
}