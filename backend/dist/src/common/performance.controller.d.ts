import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
export declare class PerformanceController {
    private readonly cacheService;
    private readonly databaseService;
    private readonly logger;
    constructor(cacheService: CacheService, databaseService: DatabaseService);
    getPerformanceStats(): Promise<{
        timestamp: string;
        cache: {
            totalEntries: number;
            validEntries: number;
            expiredEntries: number;
            totalSizeBytes: number;
            hitRatio: number;
        };
        database: {
            health: {
                status: "healthy" | "unhealthy";
                details: any;
            };
            performance: {
                tableSizes: unknown;
                indexStats: unknown;
                slowQueries: unknown;
                timestamp: string;
            };
        };
        memory: {
            rss: {
                bytes: number;
                mb: number;
                description: string;
            };
            heapTotal: {
                bytes: number;
                mb: number;
                description: string;
            };
            heapUsed: {
                bytes: number;
                mb: number;
                description: string;
            };
            external: {
                bytes: number;
                mb: number;
                description: string;
            };
            arrayBuffers: {
                bytes: number;
                mb: number;
                description: string;
            };
        };
        uptime: number;
    }>;
    getCacheStats(): Promise<{
        totalEntries: number;
        validEntries: number;
        expiredEntries: number;
        totalSizeBytes: number;
        hitRatio: number;
    }>;
    clearCache(): Promise<{
        message: string;
    }>;
    getDatabaseHealth(): Promise<{
        status: "healthy" | "unhealthy";
        details: any;
    }>;
    optimizeDatabase(): Promise<{
        message: string;
    }>;
    getMemoryStats(): {
        rss: {
            bytes: number;
            mb: number;
            description: string;
        };
        heapTotal: {
            bytes: number;
            mb: number;
            description: string;
        };
        heapUsed: {
            bytes: number;
            mb: number;
            description: string;
        };
        external: {
            bytes: number;
            mb: number;
            description: string;
        };
        arrayBuffers: {
            bytes: number;
            mb: number;
            description: string;
        };
    };
    getSystemInfo(): {
        node: {
            version: string;
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
        };
        uptime: {
            process: number;
            system: any;
        };
        cpu: {
            user: number;
            system: number;
        };
        memory: {
            rss: {
                bytes: number;
                mb: number;
                description: string;
            };
            heapTotal: {
                bytes: number;
                mb: number;
                description: string;
            };
            heapUsed: {
                bytes: number;
                mb: number;
                description: string;
            };
            external: {
                bytes: number;
                mb: number;
                description: string;
            };
            arrayBuffers: {
                bytes: number;
                mb: number;
                description: string;
            };
        };
        env: string;
        pid: number;
    };
    getPrometheusMetrics(): Promise<string>;
    runBenchmark(): Promise<{
        timestamp: string;
        tests: any;
    }>;
}
