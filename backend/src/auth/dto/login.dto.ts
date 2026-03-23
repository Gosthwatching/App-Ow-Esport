import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
