import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DriverLoginDto } from './dto/driver-login.dto';
import { DriverDataDto } from './dto/driver-data.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    getProfile(req: any): Promise<any>;
    driverLogin(driverLoginDto: DriverLoginDto): Promise<AuthResponseDto>;
    registerDriver(driverData: DriverDataDto): Promise<{
        message: string;
    }>;
}
