import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../types/user-role';

export class RegisterDto {
  @ApiProperty({ example: 'testuser', description: 'Логин пользователя' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'password123', description: 'Пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string; // DTO остается с password, но в сервисе преобразуется в password_hash

  @ApiProperty({ 
    example: UserRole.MANAGER, 
    enum: UserRole,
    description: 'Роль пользователя' 
  })
  @IsEnum(UserRole)
  role: UserRole;
}
