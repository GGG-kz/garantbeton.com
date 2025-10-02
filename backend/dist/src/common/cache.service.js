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
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
exports.Cacheable = Cacheable;
exports.CacheEvict = CacheEvict;
const common_1 = require("@nestjs/common");
let CacheService = CacheService_1 = class CacheService {
    constructor() {
        this.logger = new common_1.Logger(CacheService_1.name);
        this.cache = new Map();
        this.DEFAULT_TTL = 5 * 60 * 1000;
        setInterval(() => {
            this.cleanup();
        }, 10 * 60 * 1000);
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        this.logger.debug(`Cache HIT for key: ${key}`);
        return entry.data;
    }
    set(key, data, ttl = this.DEFAULT_TTL) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
        this.logger.debug(`Cache SET for key: ${key}, TTL: ${ttl}ms`);
    }
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.logger.debug(`Cache DELETE for key: ${key}`);
        }
        return deleted;
    }
    deletePattern(pattern) {
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
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.logger.debug(`Cache CLEAR, removed: ${size} entries`);
    }
    async getOrSet(key, factory, ttl = this.DEFAULT_TTL) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        this.logger.debug(`Cache MISS for key: ${key}, fetching data`);
        const data = await factory();
        this.set(key, data, ttl);
        return data;
    }
    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        let totalSize = 0;
        for (const [key, entry] of this.cache.entries()) {
            totalSize += JSON.stringify(entry.data).length;
            if (now - entry.timestamp > entry.ttl) {
                expiredEntries++;
            }
            else {
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
    cleanup() {
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
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CacheService);
function Cacheable(ttl = 5 * 60 * 1000, keyGenerator) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheService = this.cacheService;
            if (!cacheService) {
                return method.apply(this, args);
            }
            const cacheKey = keyGenerator
                ? keyGenerator(...args)
                : `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
            return cacheService.getOrSet(cacheKey, () => method.apply(this, args), ttl);
        };
        return descriptor;
    };
}
function CacheEvict(patterns) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await method.apply(this, args);
            const cacheService = this.cacheService;
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
//# sourceMappingURL=cache.service.js.map