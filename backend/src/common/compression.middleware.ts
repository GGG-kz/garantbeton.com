import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    
    res.on('finish', () => {
      try {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        
        // Проверяем, что заголовки еще не отправлены
        if (!res.headersSent) {
          res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
        }
      } catch (error) {
        // Игнорируем ошибки установки заголовков
        console.warn('PerformanceMiddleware: Could not set response time header:', error.message);
      }
    });
    
    next();
  }
}

export default {};



