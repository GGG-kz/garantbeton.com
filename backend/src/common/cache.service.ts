import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 минут

  constructor() {
    // Очистка кэша каждые 10 минут
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * Получить данные из кэша
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Проверяем не истек ли TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    this.logger.debug(`Cache HIT for key: ${key}`);
    return entry.data;
  }

  /**
   * Сохранить данные в кэш
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    this.logger.debug(`Cache SET for key: ${key}, TTL: ${ttl}ms`);
  }

  /**
   * Удалить данные из кэша
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache DELETE for key: ${key}`);
    }
    return deleted;
  }

  /**
   * Удалить данные по паттерну
   */
  deletePattern(pattern: string): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    if (deleted > 0) {
      this.logger.debug(`Cache DELETE pattern: ${pattern}, deleted: ${deleted}`);
    }
    
    return deleted;
  }

  /**
   * Очистить весь кэш
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.debug(`Cache CLEAR, removed: ${size} entries`);
  }

  /**
   * Получить или установить данные в кэш
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Сначала пытаемся получить из кэша
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Если нет в кэше, получаем данные и кэшируем
    this.logger.debug(`Cache MISS for key: ${key}, fetching data`);
    const data = await factory();
    this.set(key, data, ttl);
    
    return data;
  }

  /**
   * Получить статистику кэша
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalSize += JSON.stringify(entry.data).length;
      
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      totalSizeBytes: totalSize,
      hitRatio: validEntries / (validEntries + expiredEntries) || 0
    };
  }

  /**
   * Очистка устаревших записей
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }
}

// Декоратор для кэширования методов
export function Cacheable(ttl: number = 5 * 60 * 1000, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService: CacheService = this.cacheService;
      
      if (!cacheService) {
        // Если нет CacheService, выполняем метод без кэширования
        return method.apply(this, args);
      }

      // Генерируем ключ кэша
      const cacheKey = keyGenerator 
        ? keyGenerator(...args)
        : `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;

      return cacheService.getOrSet(cacheKey, () => method.apply(this, args), ttl);
    };

    return descriptor;
  };
}

// Декоратор для инвалидации кэша
export function CacheEvict(patterns: string[] | string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      const cacheService: CacheService = this.cacheService;
      if (cacheService) {
        const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
        
        for (const pattern of patternsArray) {
          cacheService.deletePattern(pattern);
        }
      }

      return result;
    };

    return descriptor;
  };
}