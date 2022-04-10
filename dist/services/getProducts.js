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
const redis_1 = require("../lib/redis");
const fixStringNumber_1 = __importDefault(require("../utils/fixStringNumber"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../../", ".env") });
function getSearchUrl(platform, search) {
    const BASE_URL = {
        cordiez: `https://www.cordiez.com.ar/s/${search}/o/OrderByPriceASC`,
        disco: `https://www.disco.com.ar/${search}?order=OrderByPriceASC`,
        vea: `https://www.vea.com.ar/${search}?OrderByPriceASC`,
        jumbo: `https://www.jumbo.com.ar/busca/?ft=${search}`,
        carrefour: `https://www.carrefour.com.ar/${search}`,
        hiperlibertad: `https://www.hiperlibertad.com.ar/busca?O=OrderByPriceASC&ft=${search}&pageNumber=1&sc=1`,
        coto: `https://www.cotodigital3.com.ar/sitios/cdigi/browse?product.language%3Aespa%C3%B1ol%2Cproduct.siteId%3ACotoDigital%29&Ns=sku.activePrice%7C0%7C%7Cproduct.displayName%7C0&Ntt=${search}&Nty=1&_D%3AsiteScope=+&atg_store_searchInput=${search}&siteScope=ok`,
        maxiconsumo: `https://maxiconsumo.com/catalogsearch/result/index/?product_list_order=price&q=${search}&product_list_limit=96&product_list_dir=asc`,
        walmart: `https://www.walmart.com.ar/buscar?text=${search}&sort=price_sv&direction=1`,
        dia: `https://diaonline.supermercadosdia.com.ar/busca/?ft=${search}`,
        "super mami": `https://www.dinoonline.com.ar/super/categoria?Nr=AND%28product.disponible%3ADisponible%2Cproduct.language%3Aespa%C3%B1ol%2Cproduct.priceListPair%3AsalePrices_listPrices%2COR%28product.siteId%3AsuperSite%29%29&Ns=sku.activePrice%7C0%7C%7Cproduct.displayName%7C0&Ntt=${search}&Nty=1&autoSuggestServiceUrl=%2Fassembler%3FassemblerContentCollection%3D%2Fcontent%2FShared%2FAuto-Suggest+Panels%26format%3Djson&containerClass=search_rubricator&defaultImage=%2Fimages%2Fno_image_auto_suggest.png&minAutoSuggestInputLength=3&rightNowEnabled=false&searchUrl=%2Fsuper`,
    };
    return `${BASE_URL[platform]}`;
}
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
        page.setViewport({ width: 1366, height: 768 });
        return { page, browser };
    });
}
function getMarketProducts(platform, page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        if (platform === "jumbo")
            return getJumboProducts(page, browser);
        if (platform === "carrefour")
            return getCarrefourProducts(page, browser);
        if (platform === "coto")
            return getCotoProducts(page, browser);
        if (platform === "disco")
            return getDiscoProducts(page, browser);
        if (platform === "vea")
            return getVeaProducts(page, browser);
        if (platform === "walmart")
            return getWalmartProducts(page, browser);
        if (platform === "maxiconsumo")
            return getMaxiProducts(page, browser);
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        if (platform === "cordiez")
            return getCordiezProducts(html);
        if (platform === "hiperlibertad")
            return getHiperlibertadProducts(html);
        if (platform === "super mami")
            return getSupermamiProducts(html);
        if (platform === "dia")
            return getDiaProducts(html);
    });
}
function getCordiezProducts(html) {
    return __awaiter(this, void 0, void 0, function* () {
        const $ = yield cheerio.load(html, null, false);
        const products = [];
        $(".searched-row .product").each((index, el) => {
            const product = $(el);
            const title = product.find("h5").text();
            const link = product.find("a").first().attr("href");
            const price = (0, fixStringNumber_1.default)(product.find(".offer-price").text().split("$")[1].trim());
            const image = product.find(".product-content img").attr("src");
            products.push({ title, price, image, link, market: "cordiez" });
        });
        return products;
    });
}
function getHiperlibertadProducts(html) {
    return __awaiter(this, void 0, void 0, function* () {
        const $ = yield cheerio.load(html, null, false);
        const products = [];
        $(".styles__ProductItem-sc-1tfhldk-0").each((index, el) => {
            const product = $(el);
            const title = product.find(".styles__TitleWrapper-sc-1tfhldk-4 h2").text();
            const link = product.find(".styles__TitleWrapper-sc-1tfhldk-4").first().attr("href");
            const price = (0, fixStringNumber_1.default)(product.find(".styles__BestPrice-sc-1tfhldk-12").text().replace("$", ""));
            const image = product.find("img").attr("src");
            products.push({ title, price, image, link, market: "hiperlibertad" });
        });
        return products;
    });
}
function getVeaProducts(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const products = [];
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        $(".vtex-search-result-3-x-galleryItem").each((index, el) => {
            const product = $(el);
            const title = product.find("h2").text().trim();
            const link = "https://www.vea.com.ar" + product.find("a").attr("href");
            const price = (0, fixStringNumber_1.default)(product.find(".vtex-flex-layout-0-x-flexRow--sellingPrice-discount ").text().replace("$", ""));
            const image = product.find("img").attr("src");
            products.push({ title, price, image, link, market: "vea" });
        });
        return products;
    });
}
function getDiscoProducts(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const products = [];
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        $(".vtex-search-result-3-x-galleryItem").each((index, el) => {
            const product = $(el);
            const title = product.find("h2").text();
            const link = "https://www.disco.com.ar" + product.find("a").attr("href");
            const price = (0, fixStringNumber_1.default)(product.find(".contenedor-precio span").text().replace("$", ""));
            const image = product.find("img").attr("src");
            products.push({ title, price, image, link, market: "disco" });
        });
        return products;
    });
}
function getJumboProducts(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const products = [];
        if (yield page.$(".empty-search-message"))
            return products;
        yield page.click('[title="Más relevantes"]');
        yield page.waitForSelector(".select2-results__options li:nth-child(3)", {
            visible: true,
        });
        yield page.click(".select2-results__options li:nth-child(3)");
        yield page.waitForNetworkIdle();
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        $(".product-shelf .gotten-product-item-data").each((index, el) => {
            const product = $(el);
            const title = product.find(".product-item__name a").text();
            const link = product.find(".product-item__name a").attr("href");
            const price = product.find(".product-prices__value--best-price ")
                ? (0, fixStringNumber_1.default)(product.find(".product-prices__value--best-price").text().replace("$", ""))
                : undefined;
            const image = product.find("img").attr("src");
            products.push({ title, price, image, link, market: "jumbo" });
        });
        return products;
    });
}
function getCarrefourProducts(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const products = [];
        if (yield page.$(".back-button"))
            return products;
        yield page.waitForSelector(".lyracons-search-result-1-x-filterPopupTitle", {
            visible: true,
            timeout: 0,
        });
        yield page.click(".lyracons-search-result-1-x-filterPopupTitle");
        yield page.waitForSelector(".lyracons-search-result-1-x-orderbypriceasc", {
            visible: true,
        });
        yield page.click(".lyracons-search-result-1-x-orderbypriceasc");
        yield page.waitForSelector(".lyracons-incompatible-cart-0-x-container", {
            visible: true,
            timeout: 0,
        });
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        $(".lyracons-search-result-1-x-galleryItem").each((index, el) => {
            const product = $(el);
            const title = product.find(".vtex-product-summary-2-x-brandName").text();
            const link = "https://www.carrefour.com.ar" +
                product.find(".vtex-product-summary-2-x-clearLink").attr("href");
            const price = product.find(".lyracons-carrefourarg-product-price-1-x-currencyContainer")
                ? (0, fixStringNumber_1.default)(product
                    .find(".lyracons-carrefourarg-product-price-1-x-currencyContainer")
                    .text()
                    .replace("$", "")
                    .trim())
                : undefined;
            const image = product.find("img").attr("src");
            products.push({ title, price, image, link, market: "carrefour" });
        });
        return products;
    });
}
function getCotoProducts(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const products = [];
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        $("#products li").each((index, el) => {
            const product = $(el);
            const title = product.find(".span_productName .descrip_full").text();
            const link = "https://www.cotodigital3.com.ar" + product.find(".product_info_container a").attr("href");
            const price = (0, fixStringNumber_1.default)(product
                .find(".atg_store_newPrice")
                .text() // eslint-disable-next-line
                .match(/[\d\.]+/g)
                .join(","));
            const image = product.find(".atg_store_productImage img").attr("src");
            if (title)
                products.push({ title, price, image, link, market: "coto" });
        });
        return products;
    });
}
function getMaxiProducts(page, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const products = [];
        yield page.waitForSelector('[data-value="asc"],.notice', { timeout: 0 });
        if (yield page.$(".notice"))
            return products;
        yield page.click('[data-value="asc"]', { timeout: 0 });
        yield page.waitForTimeout(10000);
        const html = yield page.evaluate(() => document.body.innerHTML);
        yield browser.disconnect();
        yield browser.close();
        const $ = yield cheerio.load(html, null, false);
        $(".product-item-info").each((index, el) => {
            const product = $(el);
            const title = product.find(".product-item-name").text().trim();
            const link = product.find(".product-item-link").first().attr("href");
            const price = !product.find('[data-price-type="finalPrice"]')
                ? undefined
                : (0, fixStringNumber_1.default)(product.find('[data-label="con iva"]').text().replace("$", "").replace("\n", "").trim());
            const image = product.find(".product-image-photo").attr("src");
            if (price) {
                products.push({ title, price, image, link, market: "maxiconsumo" });
            }
        });
        return products;
    });
}
function getWalmartProducts(page, browser) {
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
            const image = product.find(".prateleira__image img").attr("src");
            if (price)
                products.push({ title, price, image, link, market: "walmart" });
        });
        return products;
    });
}
function getSupermamiProducts(html) {
    return __awaiter(this, void 0, void 0, function* () {
        const $ = yield cheerio.load(html, null, false);
        const products = [];
        $(".product").each((index, el) => {
            const product = $(el);
            const title = product.find(".description ").text().trim();
            const link = "https://www.dinoonline.com.ar" + product.find(".image a").attr("href");
            const price = !product.find(".precio-unidad span")
                ? undefined
                : (0, fixStringNumber_1.default)(product
                    .find(".precio-unidad span")
                    .text() // eslint-disable-next-line
                    .match(/[\d\.]+/g)
                    .join(","));
            const image = product.find(".image img").attr("src");
            if (price) {
                products.push({ title, price, image, link, market: "super mami" });
            }
        });
        return products;
    });
}
function getDiaProducts(html) {
    return __awaiter(this, void 0, void 0, function* () {
        const $ = yield cheerio.load(html, null, false);
        const products = [];
        $(".box-item").each((index, el) => {
            const product = $(el);
            const title = product.find(".product-name ").text().trim();
            const link = product.find(".product-name a").attr("href");
            const price = !product.find(".precio-unidad")
                ? undefined
                : (0, fixStringNumber_1.default)(product.find(".best-price").text().replace("$", ""));
            const image = product.find(".product-image img").attr("src");
            if (price)
                products.push({ title, price, image, link, market: "dia" });
        });
        return products.sort(function (a, b) {
            return a.price - b.price;
        });
    });
}
function getProducts(platform, search) {
    return __awaiter(this, void 0, void 0, function* () {
        const formattedKeyword = search.trim().toLowerCase().replaceAll(" ", "%20");
        const chacheKey = `${platform}-${formattedKeyword}`;
        const cache = yield (0, redis_1.get)(chacheKey);
        if (cache)
            return cache;
        const searchUrl = getSearchUrl(platform, formattedKeyword);
        const { page, browser } = yield configureBrowser(searchUrl);
        try {
            const products = yield getMarketProducts(platform, page, browser);
            /// caching response ///
            yield (0, redis_1.saveWithTtl)(chacheKey, products, parseInt(process.env.PRODUCT_CACHE_REVALIDATION_INTERVAL_S));
            return products;
        }
        catch (error) {
            browser.disconnect();
            browser.close();
        }
    });
}
exports.default = getProducts;
//# sourceMappingURL=getProducts.js.map