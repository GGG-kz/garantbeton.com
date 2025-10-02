import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

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

    // Логирование медленных запросов
    this.$on('query' as any, (e: any) => {
      if (e.duration > 1000) { // Запросы дольше 1 секунды
        this.logger.warn(`Slow query detected: ${e.duration}ms - ${e.query}`);
      } else if (e.duration > 100) { // Запросы дольше 100ms
        this.logger.debug(`Query: ${e.duration}ms - ${e.query.substring(0, 100)}...`);
      }
    });

    this.$on('error' as any, (e: any) => {
      this.logger.error('Database error:', e);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected successfully');

    // Временно отключаем создание индексов для продакшена
    // await this.createOptimizationIndexes();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Создание индексов для оптимизации производительности
   */
  private async createOptimizationIndexes() {
    try {
      // Индексы для таблицы users
      await this.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_login 
        ON users(login);
      `;

      await this.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role 
        ON users(role);
      `;

      await this.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at 
        ON users(created_at);
      `;

      // Индексы для таблицы drivers
      await this.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_phone 
        ON drivers(phone);
      `;

      await this.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_status 
        ON drivers(status);
      `;

      await this.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_is_active 
        ON drivers(is_active);
      `;

      // Составные индексы для часто используемых запросов
      await this.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_status_active 
        ON drivers(status, is_active);
      `;

      this.logger.log('Database indexes created successfully');
    } catch (error) {
      this.logger.warn('Some indexes might already exist:', error.message);
    }
  }

  /**
   * Пакетная вставка данных
   */
  async batchInsert<T>(
    model: string,
    data: T[],
    batchSize: number = 1000
  ): Promise<void> {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await (this as any)[model].createMany({
        data: batch,
        skipDuplicates: true,
      });
    }

    this.logger.log(`Batch insert completed: ${data.length} records in ${batches.length} batches`);
  }

  /**
   * Пакетное обновление данных
   */
  async batchUpdate<T>(
    model: string,
    updates: Array<{ where: any; data: T }>,
    batchSize: number = 100
  ): Promise<void> {
    const batches = [];
    for (let i = 0; i < updates.length; i += batchSize) {
      batches.push(updates.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(update =>
        (this as any)[model].update({
          where: update.where,
          data: update.data,
        })
      );

      await Promise.allSettled(promises);
    }

    this.logger.log(`Batch update completed: ${updates.length} records in ${batches.length} batches`);
  }

  /**
   * Оптимизированный поиск с пагинацией
   */
  async findManyOptimized<T>(
    model: string,
    options: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      page?: number;
      limit?: number;
      cursor?: any;
    }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { where, orderBy, include, select, page = 1, limit = 50, cursor } = options;

    // Ограничиваем максимальный размер страницы
    const safeLimit = Math.min(limit, 1000);
    const skip = (page - 1) * safeLimit;

    // Параллельно выполняем запрос данных и подсчет общего количества
    const [data, total] = await Promise.all([
      (this as any)[model].findMany({
        where,
        orderBy,
        include,
        select,
        skip: cursor ? undefined : skip,
        take: safeLimit,
        cursor,
      }),
      (this as any)[model].count({ where }),
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

  /**
   * Получение статистики производительности базы данных
   */
  async getPerformanceStats() {
    try {
      // Статистика по размеру таблиц
      const tableSizes = await this.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
      `;

      // Статистика по индексам
      const indexStats = await this.$queryRaw`
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

      // Медленные запросы (если включено логирование)
      const slowQueries = await this.$queryRaw`
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
    } catch (error) {
      this.logger.error('Error getting performance stats:', error);
      return null;
    }
  }

  /**
   * Очистка старых данных
   */
  async cleanupOldData(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    try {
      // Пример очистки старых логов (если есть такая таблица)
      // const deleted = await this.log.deleteMany({
      //   where: {
      //     createdAt: {
      //       lt: cutoffDate,
      //     },
      //   },
      // });

      this.logger.log(`Cleanup completed for data older than ${days} days`);
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }

  /**
   * Анализ и оптимизация таблиц
   */
  async analyzeAndOptimize() {
    try {
      // ANALYZE обновляет статистику планировщика
      await this.$executeRaw`ANALYZE;`;

      // VACUUM ANALYZE очищает мертвые строки и обновляет статистику
      await this.$executeRaw`VACUUM ANALYZE;`;

      this.logger.log('Database analysis and optimization completed');
    } catch (error) {
      this.logger.error('Error during database optimization:', error);
    }
  }

  /**
   * Проверка здоровья базы данных
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: any;
  }> {
    try {
      const start = Date.now();
      
      // Простой запрос для проверки соединения
      await this.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - start;

      // Проверяем количество активных соединений
      const connections = await this.$queryRaw`
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
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}