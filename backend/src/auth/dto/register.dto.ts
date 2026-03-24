import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  faceitNickname?: string;
}
