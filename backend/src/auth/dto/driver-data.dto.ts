import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DriverDataDto {
  @ApiProperty({ description: 'ID водителя' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Логин водителя (номер телефона)' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'Временный пароль' })
  @IsString()
  @IsNotEmpty()
  tempPassword: string;

  @ApiProperty({ description: 'Полное имя водителя' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Статус водителя' })
  @IsString()
  @IsOptional()
  status?: string;
}
