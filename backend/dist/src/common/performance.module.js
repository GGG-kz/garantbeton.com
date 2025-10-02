"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceModule = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("./cache.service");
const database_service_1 = require("./database.service");
const compression_middleware_1 = require("./compression.middleware");
let PerformanceModule = class PerformanceModule {
    configure(consumer) {
        consumer
            .apply(compression_middleware_1.PerformanceMiddleware, compression_middleware_1.CompressionMiddleware)
            .forRoutes('*');
    }
};
exports.PerformanceModule = PerformanceModule;
exports.PerformanceModule = PerformanceModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            cache_service_1.CacheService,
            database_service_1.DatabaseService,
            compression_middleware_1.CompressionMiddleware,
            compression_middleware_1.PerformanceMiddleware,
        ],
        exports: [
            cache_service_1.CacheService,
            database_service_1.DatabaseService,
        ],
    })
], PerformanceModule);
//# sourceMappingURL=performance.module.js.map