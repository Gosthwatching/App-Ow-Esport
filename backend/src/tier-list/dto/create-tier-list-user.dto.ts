import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTierListUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;
}