import { NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
export declare class CompressionMiddleware implements NestMiddleware {
    private readonly handler;
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class PerformanceMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
declare const _default: {};
export default _default;
