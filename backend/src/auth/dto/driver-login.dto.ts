import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DriverLoginDto {
  @ApiProperty({
    description: 'Логин водителя (номер телефона)',
    example: '87172123456',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    description: 'Временный пароль водителя',
    example: 'TempPass1',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
