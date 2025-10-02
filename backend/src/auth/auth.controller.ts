import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DriverLoginDto } from './dto/driver-login.dto';
import { DriverDataDto } from './dto/driver-data.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Пользователь с таким логином уже существует' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешный вход', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Неверный логин или пароль' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление access токена' })
  @ApiResponse({ status: 200, description: 'Токен успешно обновлен' })
  @ApiResponse({ status: 401, description: 'Недействительный refresh токен' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('driver/login')
  @ApiOperation({ summary: 'Вход водителя в систему' })
  @ApiResponse({ status: 200, description: 'Водитель успешно вошел в систему', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Неверный логин или пароль' })
  async driverLogin(@Body() driverLoginDto: DriverLoginDto): Promise<AuthResponseDto> {
    return this.authService.driverLogin(driverLoginDto);
  }

  @Post('driver/register')
  @ApiOperation({ summary: 'Регистрация нового водителя' })
  @ApiResponse({ status: 200, description: 'Водитель успешно зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Некорректные данные водителя' })
  async registerDriver(@Body() driverData: DriverDataDto): Promise<{ message: string }> {
    return this.authService.registerDriver(driverData);
  }
}
