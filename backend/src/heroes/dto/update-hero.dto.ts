import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

const roles = ['Tank', 'DPS', 'Support'] as const;

export class UpdateHeroDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsIn(roles)
  role?: (typeof roles)[number];

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  code?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}