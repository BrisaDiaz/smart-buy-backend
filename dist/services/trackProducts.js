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
exports.getProductTrackedPrices = exports.initProductTrack = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cron_1 = require("cron");
const firebase_1 = require("../lib/firebase");
const getProductPrice_1 = __importDefault(require("./getProductPrice"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../../", ".env") });
function initProductTrack(product) {
    return __awaiter(this, void 0, void 0, function* () {
        const productFound = yield (0, firebase_1.getProductByLink)(product.link);
        if (productFound)
            return productFound;
        const createdProduct = yield (0, firebase_1.addProduct)(product);
        makePeriodicPriceUpdates(product.link, product.market);
        return createdProduct;
    });
}
exports.initProductTrack = initProductTrack;
function getProductTrackedPrices(link) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundProduct = yield (0, firebase_1.getProductPricesByLink)(link);
        return foundProduct;
    });
}
exports.getProductTrackedPrices = getProductTrackedPrices;
function makePeriodicPriceUpdates(link, market) {
    const job = new cron_1.CronJob(process.env.PRICE_CHECK_CRON_INTERVAL, () => __awaiter(this, void 0, void 0, function* () {
        try {
            const currentPrice = yield (0, getProductPrice_1.default)(link, market);
            const foundProduct = yield (0, firebase_1.getProductByLink)(link);
            if (currentPrice && foundProduct) {
                yield (0, firebase_1.updateProductPrice)(foundProduct.id, currentPrice);
            }
        }
        catch (e) {
            console.log(e);
        }
    }));
    job.start();
}
//# sourceMappingURL=trackProducts.js.map