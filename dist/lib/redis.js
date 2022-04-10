"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRedis = exports.connectRedis = exports.saveWithTtl = exports.get = void 0;
const path_1 = __importDefault(require("path"));
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../../", ".env") });
const client = (0, redis_1.createClient)({
    url: `redis://default:${process.env.REDIS_DATABASE_PASSWORD}@${process.env.REDIS_DATABASE_ENDPOINT}`,
});
client.on("error", (err) => {
    console.log("Error " + err);
});
client.on("connect", () => {
    console.log("redis connected successfully");
});
function get(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonString = yield client.get(key);
        if (jsonString) {
            return JSON.parse(jsonString);
        }
    });
}
exports.get = get;
function saveWithTtl(key, value, ttlSeconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield client.set(key, JSON.stringify(value), {
            EX: ttlSeconds,
            NX: true,
        });
    });
}
exports.saveWithTtl = saveWithTtl;
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () { return yield client.connect(); });
exports.connectRedis = connectRedis;
const disconnectRedis = () => __awaiter(void 0, void 0, void 0, function* () { return yield client.disconnect(); });
exports.disconnectRedis = disconnectRedis;
//# sourceMappingURL=redis.js.map