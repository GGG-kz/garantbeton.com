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
var PerformanceController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cache_service_1 = require("./cache.service");
const database_service_1 = require("./database.service");
let PerformanceController = PerformanceController_1 = class PerformanceController {
    constructor(cacheService, databaseService) {
        this.cacheService = cacheService;
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(PerformanceController_1.name);
    }
    async getPerformanceStats() {
        try {
            const [cacheStats, dbStats, dbHealth] = await Promise.all([
                this.getCacheStats(),
                this.databaseService.getPerformanceStats(),
                this.databaseService.healthCheck(),
            ]);
            return {
                timestamp: new Date().toISOString(),
                cache: cacheStats,
                database: {
                    health: dbHealth,
                    performance: dbStats,
                },
                memory: this.getMemoryStats(),
                uptime: process.uptime(),
            };
        }
        catch (error) {
            this.logger.error('Error getting performance stats:', error);
            throw error;
        }
    }
    async getCacheStats() {
        return this.cacheService.getStats();
    }
    async clearCache() {
        this.cacheService.clear();
        this.logger.log('Cache cleared manually');
        return { message: 'Cache cleared successfully' };
    }
    async getDatabaseHealth() {
        return this.databaseService.healthCheck();
    }
    async optimizeDatabase() {
        await this.databaseService.analyzeAndOptimize();
        this.logger.log('Database optimization completed manually');
        return { message: 'Database optimization completed' };
    }
    getMemoryStats() {
        const memUsage = process.memoryUsage();
        return {
            rss: {
                bytes: memUsage.rss,
                mb: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
                description: 'Resident Set Size - общая память, используемая процессом'
            },
            heapTotal: {
                bytes: memUsage.heapTotal,
                mb: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
                description: 'Общий размер кучи V8'
            },
            heapUsed: {
                bytes: memUsage.heapUsed,
                mb: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
                description: 'Используемая память кучи V8'
            },
            external: {
                bytes: memUsage.external,
                mb: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
                description: 'Память, используемая объектами C++, связанными с объектами JavaScript'
            },
            arrayBuffers: {
                bytes: memUsage.arrayBuffers,
                mb: Math.round(memUsage.arrayBuffers / 1024 / 1024 * 100) / 100,
                description: 'Память, выделенная для ArrayBuffers и SharedArrayBuffers'
            }
        };
    }
    getSystemInfo() {
        const cpuUsage = process.cpuUsage();
        return {
            node: {
                version: process.version,
                platform: process.platform,
                arch: process.arch,
            },
            uptime: {
                process: process.uptime(),
                system: require('os').uptime(),
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
            },
            memory: this.getMemoryStats(),
            env: process.env.NODE_ENV,
            pid: process.pid,
        };
    }
    async getPrometheusMetrics() {
        const stats = await this.getPerformanceStats();
        const memory = this.getMemoryStats();
        const metrics = [
            `# HELP nodejs_memory_heap_used_bytes Process heap memory used`,
            `# TYPE nodejs_memory_heap_used_bytes gauge`,
            `nodejs_memory_heap_used_bytes ${memory.heapUsed.bytes}`,
            ``,
            `# HELP nodejs_memory_heap_total_bytes Process heap memory total`,
            `# TYPE nodejs_memory_heap_total_bytes gauge`,
            `nodejs_memory_heap_total_bytes ${memory.heapTotal.bytes}`,
            ``,
            `# HELP nodejs_process_uptime_seconds Process uptime in seconds`,
            `# TYPE nodejs_process_uptime_seconds gauge`,
            `nodejs_process_uptime_seconds ${process.uptime()}`,
            ``,
            `# HELP cache_entries_total Total number of cache entries`,
            `# TYPE cache_entries_total gauge`,
            `cache_entries_total ${stats.cache.totalEntries}`,
            ``,
            `# HELP cache_hit_ratio Cache hit ratio`,
            `# TYPE cache_hit_ratio gauge`,
            `cache_hit_ratio ${stats.cache.hitRatio}`,
            ``,
            `# HELP database_health Database health status (1 = healthy, 0 = unhealthy)`,
            `# TYPE database_health gauge`,
            `database_health ${stats.database.health.status === 'healthy' ? 1 : 0}`,
        ];
        return metrics.join('\n');
    }
    async runBenchmark() {
        const results = {
            timestamp: new Date().toISOString(),
            tests: {},
        };
        const cacheStart = Date.now();
        for (let i = 0; i < 1000; i++) {
            this.cacheService.set(`test_${i}`, { data: `value_${i}` });
            this.cacheService.get(`test_${i}`);
        }
        results.tests.cache = {
            operations: 2000,
            duration: Date.now() - cacheStart,
            opsPerSecond: Math.round(2000 / ((Date.now() - cacheStart) / 1000)),
        };
        const dbStart = Date.now();
        try {
            await this.databaseService.$queryRaw `SELECT 1`;
            results.tests.database = {
                operation: 'simple_query',
                duration: Date.now() - dbStart,
                status: 'success',
            };
        }
        catch (error) {
            results.tests.database = {
                operation: 'simple_query',
                duration: Date.now() - dbStart,
                status: 'error',
                error: error.message,
            };
        }
        const jsonStart = Date.now();
        const testData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Test ${i}`,
            data: { nested: { value: i * 2 } },
        }));
        for (let i = 0; i < 100; i++) {
            JSON.stringify(testData);
            JSON.parse(JSON.stringify(testData));
        }
        results.tests.json = {
            operations: 200,
            duration: Date.now() - jsonStart,
            opsPerSecond: Math.round(200 / ((Date.now() - jsonStart) / 1000)),
        };
        return results;
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить статистику производительности' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика производительности' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getPerformanceStats", null);
__decorate([
    (0, common_1.Get)('cache/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить статистику кэша' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика кэша' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Get)('cache/clear'),
    (0, swagger_1.ApiOperation)({ summary: 'Очистить кэш' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Кэш очищен' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "clearCache", null);
__decorate([
    (0, common_1.Get)('database/health'),
    (0, swagger_1.ApiOperation)({ summary: 'Проверить здоровье базы данных' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус базы данных' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getDatabaseHealth", null);
__decorate([
    (0, common_1.Get)('database/optimize'),
    (0, swagger_1.ApiOperation)({ summary: 'Оптимизировать базу данных' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Оптимизация выполнена' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "optimizeDatabase", null);
__decorate([
    (0, common_1.Get)('memory'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить статистику памяти' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика использования памяти' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getMemoryStats", null);
__decorate([
    (0, common_1.Get)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить системную информацию' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Системная информация' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getSystemInfo", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить метрики в формате Prometheus' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Метрики в формате Prometheus',
        content: {
            'text/plain': {
                schema: { type: 'string' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getPrometheusMetrics", null);
__decorate([
    (0, common_1.Get)('benchmark'),
    (0, swagger_1.ApiOperation)({ summary: 'Запустить бенчмарк производительности' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Результаты бенчмарка' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "runBenchmark", null);
exports.PerformanceController = PerformanceController = PerformanceController_1 = __decorate([
    (0, swagger_1.ApiTags)('Performance'),
    (0, common_1.Controller)('performance'),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        database_service_1.DatabaseService])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map