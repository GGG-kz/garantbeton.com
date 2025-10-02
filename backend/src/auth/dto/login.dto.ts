import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'developer', description: 'Логин пользователя' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'developer123', description: 'Пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
