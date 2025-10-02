import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';

@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику производительности' })
  @ApiResponse({ status: 200, description: 'Статистика производительности' })
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
    } catch (error) {
      this.logger.error('Error getting performance stats:', error);
      throw error;
    }
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Получить статистику кэша' })
  @ApiResponse({ status: 200, description: 'Статистика кэша' })
  async getCacheStats() {
    return this.cacheService.getStats();
  }

  @Get('cache/clear')
  @ApiOperation({ summary: 'Очистить кэш' })
  @ApiResponse({ status: 200, description: 'Кэш очищен' })
  async clearCache() {
    this.cacheService.clear();
    this.logger.log('Cache cleared manually');
    return { message: 'Cache cleared successfully' };
  }

  @Get('database/health')
  @ApiOperation({ summary: 'Проверить здоровье базы данных' })
  @ApiResponse({ status: 200, description: 'Статус базы данных' })
  async getDatabaseHealth() {
    return this.databaseService.healthCheck();
  }

  @Get('database/optimize')
  @ApiOperation({ summary: 'Оптимизировать базу данных' })
  @ApiResponse({ status: 200, description: 'Оптимизация выполнена' })
  async optimizeDatabase() {
    await this.databaseService.analyzeAndOptimize();
    this.logger.log('Database optimization completed manually');
    return { message: 'Database optimization completed' };
  }

  @Get('memory')
  @ApiOperation({ summary: 'Получить статистику памяти' })
  @ApiResponse({ status: 200, description: 'Статистика использования памяти' })
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

  @Get('system')
  @ApiOperation({ summary: 'Получить системную информацию' })
  @ApiResponse({ status: 200, description: 'Системная информация' })
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

  @Get('metrics')
  @ApiOperation({ summary: 'Получить метрики в формате Prometheus' })
  @ApiResponse({ 
    status: 200, 
    description: 'Метрики в формате Prometheus',
    content: {
      'text/plain': {
        schema: { type: 'string' }
      }
    }
  })
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

  @Get('benchmark')
  @ApiOperation({ summary: 'Запустить бенчмарк производительности' })
  @ApiResponse({ status: 200, description: 'Результаты бенчмарка' })
  async runBenchmark() {
    const results = {
      timestamp: new Date().toISOString(),
      tests: {} as any,
    };

    // Тест производительности кэша
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

    // Тест производительности базы данных
    const dbStart = Date.now();
    try {
      await this.databaseService.$queryRaw`SELECT 1`;
      results.tests.database = {
        operation: 'simple_query',
        duration: Date.now() - dbStart,
        status: 'success',
      };
    } catch (error) {
      results.tests.database = {
        operation: 'simple_query',
        duration: Date.now() - dbStart,
        status: 'error',
        error: error.message,
      };
    }

    // Тест сериализации JSON
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
}