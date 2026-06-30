import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        const options: any = {
          maxRetriesPerRequest: 3,
        };
        // Aiven secure connections start with rediss:// and require TLS settings
        if (redisUrl.startsWith('rediss://')) {
          options.tls = {
            rejectUnauthorized: false,
          };
        }
        this.redis = new Redis(redisUrl, options);

        this.redis.on('connect', () => {
          this.logger.log('Redis connected successfully');
        });

        this.redis.on('error', (err) => {
          this.logger.error(`Redis error: ${err.message}`);
        });
      } catch (err: any) {
        this.logger.error(`Failed to initialize Redis client: ${err.message}`);
      }
    } else {
      this.logger.warn('REDIS_URL is not set. Redis caching is disabled.');
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  /**
   * Fetch a value from Redis cache. Returns null if not found or if Redis is offline.
   */
  async get(key: string): Promise<string | null> {
    if (!this.redis) return null;
    try {
      return await this.redis.get(key);
    } catch (err: any) {
      this.logger.warn(`Failed to GET cache key "${key}": ${err.message}`);
      return null;
    }
  }

  /**
   * Store a value in Redis cache with an optional TTL (Time To Live).
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return;
    try {
      if (ttlSeconds) {
        await this.redis.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, value);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to SET cache key "${key}": ${err.message}`);
    }
  }

  /**
   * Delete a specific key from Redis cache.
   */
  async del(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (err: any) {
      this.logger.warn(`Failed to DEL cache key "${key}": ${err.message}`);
    }
  }

  /**
   * Invalidate multiple keys matching a pattern (e.g. "arenas:list:*") using scanStream.
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const client = this.redis;
    if (!client) return;
    try {
      const stream = client.scanStream({
        match: pattern,
        count: 100,
      });

      const deleteKeys = (keys: string[]): Promise<void> => {
        return new Promise((resolve) => {
          if (keys.length === 0) return resolve();
          client.del(...keys)
            .then(() => resolve())
            .catch((err) => {
              this.logger.warn(`Failed to delete scanned keys: ${err.message}`);
              resolve();
            });
        });
      };

      await new Promise<void>((resolve, reject) => {
        stream.on('data', async (keys: string[]) => {
          stream.pause();
          await deleteKeys(keys);
          stream.resume();
        });
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });
    } catch (err: any) {
      this.logger.warn(`Failed to invalidate pattern "${pattern}": ${err.message}`);
    }
  }
}
