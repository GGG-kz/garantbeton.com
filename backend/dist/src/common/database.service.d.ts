import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class DatabaseService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private createOptimizationIndexes;
    batchInsert<T>(model: string, data: T[], batchSize?: number): Promise<void>;
    batchUpdate<T>(model: string, updates: Array<{
        where: any;
        data: T;
    }>, batchSize?: number): Promise<void>;
    findManyOptimized<T>(model: string, options: {
        where?: any;
        orderBy?: any;
        include?: any;
        select?: any;
        page?: number;
        limit?: number;
        cursor?: any;
    }): Promise<{
        data: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getPerformanceStats(): Promise<{
        tableSizes: unknown;
        indexStats: unknown;
        slowQueries: unknown;
        timestamp: string;
    }>;
    cleanupOldData(days?: number): Promise<void>;
    analyzeAndOptimize(): Promise<void>;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: any;
    }>;
}
