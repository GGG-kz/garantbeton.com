"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const user_role_1 = require("../types/user-role");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.driverRegistry = [];
    }
    async register(registerDto) {
        const { login, password, role } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { login },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Пользователь с таким логином уже существует');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                login,
                password: passwordHash,
                role: role,
            },
        });
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
    async login(loginDto) {
        const { login, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { login },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Неверный логин или пароль');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Неверный логин или пароль');
        }
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
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Пользователь не найден');
            }
            const accessToken = this.jwtService.sign({
                sub: user.id,
                login: user.login,
                role: user.role,
            }, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
            });
            return { accessToken };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Недействительный refresh токен');
        }
    }
    async generateTokens(userId, login, role) {
        const payload = {
            sub: userId,
            login,
            role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async validateUser(userId) {
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
    async driverLogin(driverLoginDto) {
        const { login, password } = driverLoginDto;
        const drivers = this.getRegisteredDrivers();
        const driver = drivers.find(d => d.login === login);
        if (!driver) {
            throw new common_1.UnauthorizedException('Водитель с таким логином не найден');
        }
        if (driver.tempPassword !== password) {
            throw new common_1.UnauthorizedException('Неверный пароль');
        }
        if (driver.status === 'inactive') {
            throw new common_1.UnauthorizedException('Аккаунт водителя деактивирован');
        }
        const tokens = await this.generateTokens(driver.id, driver.login, user_role_1.UserRole.DRIVER);
        return {
            ...tokens,
            user: {
                id: driver.id,
                login: driver.login,
                role: user_role_1.UserRole.DRIVER,
                fullName: driver.fullName,
            },
        };
    }
    async registerDriver(driverData) {
        const driverWithDefaults = {
            ...driverData,
            status: driverData.status || 'active'
        };
        this.addDriverToRegistry(driverWithDefaults);
        return { message: 'Водитель успешно зарегистрирован' };
    }
    getRegisteredDrivers() {
        return this.driverRegistry;
    }
    addDriverToRegistry(driverData) {
        const driverWithDefaults = {
            ...driverData,
            status: driverData.status || 'active'
        };
        const existingDriver = this.driverRegistry.find(d => d.login === driverWithDefaults.login);
        if (existingDriver) {
            Object.assign(existingDriver, driverWithDefaults);
        }
        else {
            this.driverRegistry.push(driverWithDefaults);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map