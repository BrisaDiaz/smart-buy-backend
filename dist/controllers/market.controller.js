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
exports.getMarketProducts = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const getProducts_1 = __importDefault(require("../services/getProducts"));
const MARKETS = [
    "cordiez",
    "coto",
    "dia",
    "disco",
    "hiperlibertad",
    "jumbo",
    "maxiconsumo",
    "super mami",
    "walmart",
    "vea",
];
exports.getMarketProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query, market } = req.query;
    if (!query)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "empty search query");
    if (!market)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "empty market query");
    if (Array.isArray(market)) {
        const isValidMarket = market.every((current) => MARKETS.includes(current));
        if (!isValidMarket)
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "invalid markets");
        const promises = market.map((market) => (0, getProducts_1.default)(market, query));
        const results = yield Promise.all(promises);
        const products = results.flat().sort(function (a, b) {
            return a.price - b.price;
        });
        res.json({ products, total: products.length });
    }
    const isValidMarket = MARKETS.includes(market);
    if (!isValidMarket)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "invalid market");
    const products = yield (0, getProducts_1.default)(market, query);
    res.json({ products, total: products === null || products === void 0 ? void 0 : products.length });
}));
//# sourceMappingURL=market.controller.js.map