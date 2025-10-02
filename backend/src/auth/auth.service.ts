import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DriverLoginDto } from './dto/driver-login.dto';
import { DriverDataDto } from './dto/driver-data.dto';
import { UserRole } from '../types/user-role';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { login, password, role } = registerDto;

    // Проверяем, существует ли пользователь
    const existingUser = await this.prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким логином уже существует');
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await this.prisma.user.create({
      data: {
        login,
        password: passwordHash,
        role: role, // Используем строку напрямую
      },
    });

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.login, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { login, password } = loginDto;

    // Находим пользователя
    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.login, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          login: user.login,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Недействительный refresh токен');
    }
  }

  private async generateTokens(userId: string, login: string, role: string) {
    const payload = {
      sub: userId,
      login,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Динамическая система для аутентификации водителей
  async driverLogin(driverLoginDto: DriverLoginDto): Promise<AuthResponseDto> {
    const { login, password } = driverLoginDto;

    // Получаем данные водителей из глобального хранилища или используем заглушку
    const drivers = this.getRegisteredDrivers();

    // Находим водителя
    const driver = drivers.find(d => d.login === login);

    if (!driver) {
      throw new UnauthorizedException('Водитель с таким логином не найден');
    }

    // Проверяем временный пароль
    if (driver.tempPassword !== password) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Проверяем статус водителя
    if (driver.status === 'inactive') {
      throw new UnauthorizedException('Аккаунт водителя деактивирован');
    }

    // Генерируем токены для водителя
    const tokens = await this.generateTokens(driver.id, driver.login, UserRole.DRIVER);

    return {
      ...tokens,
      user: {
        id: driver.id,
        login: driver.login,
        role: UserRole.DRIVER,
        fullName: driver.fullName,
      },
    };
  }

  // Регистрация нового водителя
  async registerDriver(driverData: DriverDataDto): Promise<{ message: string }> {
    // Устанавливаем статус по умолчанию, если не указан
    const driverWithDefaults = {
      ...driverData,
      status: driverData.status || 'active'
    };
    
    // Добавляем водителя в глобальное хранилище
    this.addDriverToRegistry(driverWithDefaults);
    
    return { message: 'Водитель успешно зарегистрирован' };
  }

  // Глобальное хранилище водителей (в будущем заменить на базу данных)
  private driverRegistry: DriverDataDto[] = [];

  private getRegisteredDrivers(): DriverDataDto[] {
    return this.driverRegistry;
  }

  private addDriverToRegistry(driverData: DriverDataDto): void {
    // Устанавливаем статус по умолчанию, если не указан
    const driverWithDefaults = {
      ...driverData,
      status: driverData.status || 'active'
    };
    
    // Проверяем, не существует ли уже водитель с таким логином
    const existingDriver = this.driverRegistry.find(d => d.login === driverWithDefaults.login);
    if (existingDriver) {
      // Обновляем существующего водителя
      Object.assign(existingDriver, driverWithDefaults);
    } else {
      // Добавляем нового водителя
      this.driverRegistry.push(driverWithDefaults);
    }
  }
}
