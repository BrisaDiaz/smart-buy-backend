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
exports.getTrackedProduct = exports.trackProduct = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const trackProducts_1 = require("../services/trackProducts");
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
const PRODUCT_PROPS = ["title", "link", "market", "price", "image"];
exports.trackProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product } = req.body;
    if (!product)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "No product information was provided");
    const productsProps = Object.keys(product);
    const includesRequiredProps = productsProps.length === PRODUCT_PROPS.length &&
        productsProps.every((prop) => PRODUCT_PROPS.includes(prop));
    if (!includesRequiredProps)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid product schema");
    if (!MARKETS.includes(product.market))
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "invalid market");
    const trackedProduct = yield (0, trackProducts_1.initProductTrack)(product);
    res.status(201).send(trackedProduct);
}));
exports.getTrackedProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link } = req.query;
    if (!link)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "The product link wast not provided");
    const isValidUrl = link.match(
    // eslint-disable-next-line
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (!isValidUrl)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid link");
    const results = yield (0, trackProducts_1.getProductTrackedPrices)(link);
    if (!results)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No product with the provided link was found");
    res.send(results);
}));
//# sourceMappingURL=tracker.controller.js.map