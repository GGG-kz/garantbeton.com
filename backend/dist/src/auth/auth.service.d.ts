import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DriverLoginDto } from './dto/driver-login.dto';
import { DriverDataDto } from './dto/driver-data.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    private generateTokens;
    validateUser(userId: string): Promise<{
        id: string;
        login: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    driverLogin(driverLoginDto: DriverLoginDto): Promise<AuthResponseDto>;
    registerDriver(driverData: DriverDataDto): Promise<{
        message: string;
    }>;
    private driverRegistry;
    private getRegisteredDrivers;
    private addDriverToRegistry;
}
