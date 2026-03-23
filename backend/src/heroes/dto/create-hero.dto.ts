import { IsIn, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

const roles = ['Tank', 'DPS', 'Support'] as const;

export class CreateHeroDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsIn(roles)
  role: (typeof roles)[number];

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  code: string;

  @IsUrl()
  imageUrl: string;
}