export declare class CacheService {
    private readonly logger;
    private cache;
    private readonly DEFAULT_TTL;
    constructor();
    get<T>(key: string): T | null;
    set<T>(key: string, data: T, ttl?: number): void;
    delete(key: string): boolean;
    deletePattern(pattern: string): number;
    clear(): void;
    getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>;
    getStats(): {
        totalEntries: number;
        validEntries: number;
        expiredEntries: number;
        totalSizeBytes: number;
        hitRatio: number;
    };
    private cleanup;
}
export declare function Cacheable(ttl?: number, keyGenerator?: (...args: any[]) => string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheEvict(patterns: string[] | string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
