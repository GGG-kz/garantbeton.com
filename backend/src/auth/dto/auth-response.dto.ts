import { ApiProperty } from '@nestjs/swagger';
// import { UserRole } from '../../types/user-role'; // Используем строки вместо enum

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access токен' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh токен' })
  refreshToken: string;

  @ApiProperty({ description: 'Информация о пользователе' })
  user: {
    id: string;
    login: string;
    role: string;
    fullName?: string;
  };
}
