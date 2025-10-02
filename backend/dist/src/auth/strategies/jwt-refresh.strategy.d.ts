import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: any): Promise<{
        userId: any;
        login: any;
        role: any;
    }>;
}
export {};
