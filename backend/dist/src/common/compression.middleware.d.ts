import { NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
export declare class PerformanceMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
declare const _default: {};
export default _default;
