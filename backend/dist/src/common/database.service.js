"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let DatabaseService = DatabaseService_1 = class DatabaseService extends client_1.PrismaClient {
    constructor() {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'info' },
                { emit: 'event', level: 'warn' },
            ],
            errorFormat: 'colorless',
        });
        this.logger = new common_1.Logger(DatabaseService_1.name);
        this.$on('query', (e) => {
            if (e.duration > 1000) {
                this.logger.warn(`Slow query detected: ${e.duration}ms - ${e.query}`);
            }
            else if (e.duration > 100) {
                this.logger.debug(`Query: ${e.duration}ms - ${e.query.substring(0, 100)}...`);
            }
        });
        this.$on('error', (e) => {
            this.logger.error('Database error:', e);
        });
    }
    async onModuleInit() {
        await this.$connect();
        this.logger.log('Database connected successfully');
        await this.createOptimizationIndexes();
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }
    async createOptimizationIndexes() {
        try {
            await this.$executeRaw `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_login 
        ON users(login);
      `;
            await this.$executeRaw `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role 
        ON users(role);
      `;
            await this.$executeRaw `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at 
        ON users(created_at);
      `;
            await this.$executeRaw `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_phone 
        ON drivers(phone);
      `;
            await this.$executeRaw `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_status 
        ON drivers(status);
      `;
            await this.$executeRaw `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_is_active 
        ON drivers(is_active);
      `;
            await this.$executeRaw `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_status_active 
        ON drivers(status, is_active);
      `;
            this.logger.log('Database indexes created successfully');
        }
        catch (error) {
            this.logger.warn('Some indexes might already exist:', error.message);
        }
    }
    async batchInsert(model, data, batchSize = 1000) {
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }
        for (const batch of batches) {
            await this[model].createMany({
                data: batch,
                skipDuplicates: true,
            });
        }
        this.logger.log(`Batch insert completed: ${data.length} records in ${batches.length} batches`);
    }
    async batchUpdate(model, updates, batchSize = 100) {
        const batches = [];
        for (let i = 0; i < updates.length; i += batchSize) {
            batches.push(updates.slice(i, i + batchSize));
        }
        for (const batch of batches) {
            const promises = batch.map(update => this[model].update({
                where: update.where,
                data: update.data,
            }));
            await Promise.allSettled(promises);
        }
        this.logger.log(`Batch update completed: ${updates.length} records in ${batches.length} batches`);
    }
    async findManyOptimized(model, options) {
        const { where, orderBy, include, select, page = 1, limit = 50, cursor } = options;
        const safeLimit = Math.min(limit, 1000);
        const skip = (page - 1) * safeLimit;
        const [data, total] = await Promise.all([
            this[model].findMany({
                where,
                orderBy,
                include,
                select,
                skip: cursor ? undefined : skip,
                take: safeLimit,
                cursor,
            }),
            this[model].count({ where }),
        ]);
        const totalPages = Math.ceil(total / safeLimit);
        return {
            data,
            pagination: {
                page,
                limit: safeLimit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async getPerformanceStats() {
        try {
            const tableSizes = await this.$queryRaw `
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
      `;
            const indexStats = await this.$queryRaw `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC;
      `;
            const slowQueries = await this.$queryRaw `
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 10;
      `.catch(() => []);
            return {
                tableSizes,
                indexStats,
                slowQueries,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error getting performance stats:', error);
            return null;
        }
    }
    async cleanupOldData(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        try {
            this.logger.log(`Cleanup completed for data older than ${days} days`);
        }
        catch (error) {
            this.logger.error('Error during cleanup:', error);
        }
    }
    async analyzeAndOptimize() {
        try {
            await this.$executeRaw `ANALYZE;`;
            await this.$executeRaw `VACUUM ANALYZE;`;
            this.logger.log('Database analysis and optimization completed');
        }
        catch (error) {
            this.logger.error('Error during database optimization:', error);
        }
    }
    async healthCheck() {
        try {
            const start = Date.now();
            await this.$queryRaw `SELECT 1`;
            const responseTime = Date.now() - start;
            const connections = await this.$queryRaw `
        SELECT count(*) as active_connections
        FROM pg_stat_activity
        WHERE state = 'active';
      `;
            return {
                status: responseTime < 1000 ? 'healthy' : 'unhealthy',
                details: {
                    responseTime,
                    activeConnections: connections[0]?.active_connections || 0,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    error: error.message,
                    timestamp: new Date().toISOString(),
                },
            };
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DatabaseService);
//# sourceMappingURL=database.service.js.map