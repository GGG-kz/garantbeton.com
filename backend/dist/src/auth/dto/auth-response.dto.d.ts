export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        login: string;
        role: string;
        fullName?: string;
    };
}
