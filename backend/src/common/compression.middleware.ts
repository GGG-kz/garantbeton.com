import { Injectable, NestMiddleware } from '@nestjs/common';
import compression from 'compression';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private readonly handler = compression({
    threshold: 1024,
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.handler(req, res, next);
  }
}

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      (res as any).setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
    });
    next();
  }
}

export default {};



