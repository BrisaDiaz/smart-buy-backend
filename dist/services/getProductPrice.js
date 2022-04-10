"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const path_1 = __importDefault(require("path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const cheerio = __importStar(require("cheerio"));
const dotenv_1 = __importDefault(require("dotenv"));
const fixStringNumber_1 = __importDefault(require("../utils/fixStringNumber"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../../", ".env") });
const minimalArgs = [
    "--autoplay-policy=user-gesture-required",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-domain-reliability",
    "--disable-extensions",
    "--disable-features=AudioServiceOutOfProcess",
    "--disable-hang-monitor",
    "--disable-ipc-flooding-protection",
    "--disable-notifications",
    "--disable-offer-store-unmasked-wallet-cards",
    "--disable-popup-blocking",
    "--disable-print-preview",
    "--disable-prompt-on-repost",
    "--disable-renderer-backgrounding",
    "--disable-setuid-sandbox",
    "--disable-speech-api",
    "--disable-sync",
    "--hide-scrollbars",
    "--ignore-gpu-blacklist",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-pings",
    "--no-sandbox",
    "--no-zygote",
    "--password-store=basic",
    "--use-gl=swiftshader",
    "--use-mock-keychain",
];
function configureBrowser(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: minimalArgs,
        });
        const page = yield browser.newPage();
        page.setViewport({ width: 1366, height: 768 });
        yield page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 0,
        });
        yield page.setRequestInterception(true);
        page.on("request", (request) => {
            if (request.resourceType() === "stylesheet")
                request.abort();
            else
                request.continue();
        });
        return { page, browser };
    });
}
function getMarketProductPrice(platform, page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        if (platform === "jumbo")
            return getJumboProductPrice(page, browser);
        if (platform === "carrefour")
            return getCarrefourProductPrice(page, browser);
        if (platform === "coto")
            return getCotoProductPrice(page, browser);
        if (platform === "disco")
            return getDiscoProductPrice(page, browser);
        if (platform === "vea")
            return getVeaProductPrice(page, browser);
        if (platform === "walmart")
            return getWalmartProductPrice(page, browser);
        if (platform === "cordiez")
            return getCordiezProductPrice(page, browser);
        if (platform === "hiperlibertad")
            return getHiperlibertadProductPrice(page, browser);
        if (platform === "maxiconsumo")
            return getMaxiProductPrice(page, browser);
        if (platform === "super mami")
            return getSupermamiProductPrice(page, browser);
        if (platform === "dia")
            return getDiaProductPrice(page, browser);
    });
}
function getCordiezProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield page.$(".shop-single"))) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = (0, fixStringNumber_1.default)($(".offer-price").first().text().replace("$", ""));
        return price;
    });
}
function getHiperlibertadProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector(".styles__BestPrice-ylrwvm-0, .tyles__NotFound-sc-1wrfq72-0");
        if (yield page.$(".tyles__NotFound-sc-1wrfq72-0")) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = $(".contenedor-precio span")
            ? (0, fixStringNumber_1.default)($(" .styles__BestPrice-ylrwvm-0").first().text().replace("$", ""))
            : undefined;
        return price;
    });
}
function getVeaProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector(".contenedor-precio span, .vtex-search-result-3-x-notFound--layout");
        if (yield page.$(".vtex-search-result-3-x-notFound--layout")) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = $(".contenedor-precio span")
            ? (0, fixStringNumber_1.default)($(" .contenedor-precio span").first().text().replace("$", ""))
            : undefined;
        return price;
    });
}
function getDiscoProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector(".contenedor-precio span, .vtex-search-result-3-x-notFound--layout");
        if (yield page.$(".vtex-search-result-3-x-notFound--layout")) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = $(".contenedor-precio span")
            ? (0, fixStringNumber_1.default)($(" .contenedor-precio span").first().text().replace("$", ""))
            : undefined;
        return price;
    });
}
function getJumboProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector(".skuBestPrice , .empty-search-message");
        if (yield page.$(".empty-search-message")) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = (0, fixStringNumber_1.default)($(".skuBestPrice").text().replace("$", ""));
        return price;
    });
}
function getCarrefourProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector(".lyracons-carrefourarg-product-price-1-x-sellingPriceValue, .tex-flex-layout-0-x-flexRow--notFoundRow1");
        if (yield page.$(".tex-flex-layout-0-x-flexRow--notFoundRow1")) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = (0, fixStringNumber_1.default)($(".vtex-flex-layout-0-x-flexRowContent--product-view-product-main")
            .find(".lyracons-carrefourarg-product-price-1-x-sellingPriceValue")
            .first()
            .text()
            .replace("$", ""));
        return price;
    });
}
function getCotoProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector('[id="atg_store_content"]');
        if (!(yield page.$(".atg_store_newPrice"))) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = (0, fixStringNumber_1.default)($(".atg_store_productPrice")
            .text() // eslint-disable-next-line
            .match(/[\d\.]+/g)
            .join(","));
        return price;
    });
}
function getMaxiProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector(".price, .wrapper_404page", { timeout: 0 });
        if (yield page.$(".wrapper_404page")) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = (0, fixStringNumber_1.default)($(".price").first().text().replace("$", ""));
        return price;
    });
}
function getWalmartProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const products = [];
        $(".prateleira__item").each((index, el) => {
            const product = $(el);
            const title = product.find(".prateleira__name").text().trim();
            const link = "https://www.walmart.com.ar" + product.find(".prateleira__name").first().attr("href");
            const price = !product.find(".prateleira__best-price")
                ? undefined
                : (0, fixStringNumber_1.default)(product.find(".prateleira__best-price").text().replace("$", ""));
            const image = {
                src: product.find(".prateleira__image img").attr("src"),
                alt: product.find(".prateleira__image img").attr("alt"),
            };
            if (price)
                products.push({ title, price, image, link, market: "walmart" });
        });
        return products;
    });
}
function getSupermamiProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector('[id="productLandingPage"]');
        if (!(yield page.$('[id="productLandingPage"]'))) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = (0, fixStringNumber_1.default)($('[id="productLandingPage"]')
            .find(".precio-unidad span")
            .text()
            .replace("$", "")
            .replace(".", ","));
        return price;
    });
}
function getDiaProductPrice(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.waitForSelector(".contenedor-precio , .render-route-store-not-found-product");
        if (yield page.$(".render-route-store-not-found-product")) {
            yield browser.disconnect();
            yield browser.close();
            return undefined;
        }
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        const price = (0, fixStringNumber_1.default)($(".contenedor-precio span").first().text().replace("$", ""));
        return price;
    });
}
function getProductPrice(productLink, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, browser } = yield configureBrowser(productLink);
        try {
            const price = yield getMarketProductPrice(platform, page, browser);
            return typeof price === "number" ? price : undefined;
        }
        catch (error) {
            browser.disconnect();
            browser.close();
        }
    });
}
exports.default = getProductPrice;
//# sourceMappingURL=getProductPrice.js.map