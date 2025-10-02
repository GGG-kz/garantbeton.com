"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMiddleware = exports.CompressionMiddleware = void 0;
const common_1 = require("@nestjs/common");
const compression_1 = require("compression");
let CompressionMiddleware = class CompressionMiddleware {
    constructor() {
        this.handler = (0, compression_1.default)({
            threshold: 1024,
        });
    }
    use(req, res, next) {
        this.handler(req, res, next);
    }
};
exports.CompressionMiddleware = CompressionMiddleware;
exports.CompressionMiddleware = CompressionMiddleware = __decorate([
    (0, common_1.Injectable)()
], CompressionMiddleware);
let PerformanceMiddleware = class PerformanceMiddleware {
    use(req, res, next) {
        const start = process.hrtime.bigint();
        res.on('finish', () => {
            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1000000;
            res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
        });
        next();
    }
};
exports.PerformanceMiddleware = PerformanceMiddleware;
exports.PerformanceMiddleware = PerformanceMiddleware = __decorate([
    (0, common_1.Injectable)()
], PerformanceMiddleware);
exports.default = {};
//# sourceMappingURL=compression.middleware.js.map