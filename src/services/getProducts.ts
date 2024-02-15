import puppeteer, {Page, Browser} from "puppeteer";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

import {Product} from "../interfaces";
import {saveWithTtl, get} from "../lib/redis";
import fixStringNumber from "../utils/fixStringNumber";
dotenv.config({path: ".env"});

function getSearchUrl(market: string, search: string) {
  const BASE_URL: {[marketName: string]: string} = {
    cordiez: `https://www.cordiez.com.ar/s/${search}/o/OrderByPriceASC`,
    disco: `https://www.disco.com.ar/${search}?order=OrderByPriceASC`,
    vea: `https://www.vea.com.ar/${search}?OrderByPriceASC`,
    jumbo: `https://www.jumbo.com.ar/busca/?ft=${search}`,
    carrefour: `https://www.carrefour.com.ar/${search}?order=OrderByPriceASC`,
    hiperlibertad: `https://www.hiperlibertad.com.ar/busca?O=OrderByPriceASC&ft=${search}&pageNumber=1&sc=1`,
    coto: `https://www.cotodigital3.com.ar/sitios/cdigi/browse?product.language%3Aespa%C3%B1ol%2Cproduct.siteId%3ACotoDigital%29&Ns=sku.activePrice%7C0%7C%7Cproduct.displayName%7C0&Ntt=${search}&Nty=1&_D%3AsiteScope=+&atg_store_searchInput=${search}&siteScope=ok`,
    maxiconsumo: `https://maxiconsumo.com/catalogsearch/result/index/?product_list_order=price&q=${search}&product_list_limit=96&product_list_dir=asc`,
    "la anonima online": `https://supermercado.laanonimaonline.com/buscar?clave=${search}&pag=1&&orden=mep`,
    dia: `https://diaonline.supermercadosdia.com.ar/${search}?_q=${search}&map=ft&order=OrderByPriceASC`,
    "super mami": `https://www.dinoonline.com.ar/super/categoria?Nr=AND%28product.disponible%3ADisponible%2Cproduct.language%3Aespa%C3%B1ol%2Cproduct.priceListPair%3AsalePrices_listPrices%2COR%28product.siteId%3AsuperSite%29%29&Ns=sku.activePrice%7C0%7C%7Cproduct.displayName%7C0&Ntt=${search}&Nty=1&autoSuggestServiceUrl=%2Fassembler%3FassemblerContentCollection%3D%2Fcontent%2FShared%2FAuto-Suggest+Panels%26format%3Djson&containerClass=search_rubricator&defaultImage=%2Fimages%2Fno_image_auto_suggest.png&minAutoSuggestInputLength=3&rightNowEnabled=false&searchUrl=%2Fsuper`,
  };

  return `${BASE_URL[market]}`;
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
  "--force-device-scale-factor=0.5",
  "--headless",
  "--window-size=0,6000",
];

async function configureBrowser(url: string) {
  const browser = await puppeteer.launch(
    process.env.NODE_ENV === "production"
      ? {
          headless: true,
          args: minimalArgs,
        }
      : {headless: false},
  );
  const page = await browser.newPage();

  await page.setViewport({width: 2560, height: 6000});
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
  );

  return {page, browser};
}

async function getMarketProducts(market: string, page: Page, browser: Browser) {
  if (market === "jumbo") return getJumboProducts(page, browser);
  if (market === "carrefour") return getCarrefourProducts(page, browser);
  if (market === "coto") return getCotoProducts(page, browser);
  if (market === "disco") return getDiscoProducts(page, browser);
  if (market === "vea") return getVeaProducts(page, browser);
  if (market === "la anonima online") return getAnonimaProducts(page, browser);
  if (market === "maxiconsumo") return getMaxiProducts(page, browser);
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });

  const html: string = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  if (market === "cordiez") return getCordiezProducts(html);
  if (market === "hiperlibertad") return getHiperlibertadProducts(html);

  if (market === "super mami") return getSupermamiProducts(html);
  if (market === "dia") return getDiaProducts(html);
}
async function getCordiezProducts(html: string) {
  const $ = await cheerio.load(html, null, false);
  const products: Product[] = [];

  $(".searched-row .product").each((index, el) => {
    const product = $(el);
    const title = product.find("h5").text();
    const link = product.find("a").first().attr("href") as string;
    const price = fixStringNumber(product.find(".offer-price").text().split("$")[1].trim());
    const image = product.find(".product-content img").attr("src") as string;

    products.push({title, price, image, link, market: "cordiez"});
  });

  return products;
}
async function getHiperlibertadProducts(html: string) {
  const $ = await cheerio.load(html, null, false);
  const products: Product[] = [];

  $(".styles__ProductItem-sc-1tfhldk-0").each((index, el) => {
    const product = $(el);
    const title = product.find("h2").text();
    const link = product.find("a").first().attr("href") as string;
    const price = fixStringNumber(
      product.find(".styles__BestPrice-sc-1tfhldk-12").text().split("$")[1].trim(),
    );
    const image = product.find("img").attr("src") as string;

    products.push({title, price, image, link, market: "hiperlibertad"});
  });

  return products;
}
async function getAnonimaProducts(page: Page, browser: Browser) {
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });

  await page.$$eval('producto .item', (images) => {
    images.forEach(async (img) => {
      img.scrollIntoView();
      await page.waitForTimeout(3000);
    });
  });

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);
  const products: Product[] = [];

  $('.producto .item').each((index, el) => {
    const product = $(el);
    const title = product.find('.titulo02').text().trim();
    const link = `https://supermercado.laanonimaonline.com${product
      .find('a')
      .first()
      .attr('href')}`;
    const price = fixStringNumber(
      product.find('.precio').text().replace('$', ''),
    );

    product.find('img').removeClass('lazyloading');
    const imageSrc = product.find('img').attr('src');
    const image = `${
      imageSrc.includes('https')
        ? ''
        : 'https://supermercado.laanonimaonline.com'
    }${imageSrc}`;

    if (price)
      products.push({ title, price, image, link, market: 'la anonima online' });
  });

  return products;
}
async function getVeaProducts(page: Page, browser: Browser) {
  const products: Product[] = [];

  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  await page.$$eval('producto .item', (images) => {
    images.forEach(async (img) => {
      img.scrollIntoView();
      await page.waitForTimeout(3000);
    });
  });
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  $('.vtex-search-result-3-x-galleryItem').each((index, el) => {
    const product = $(el);

    const title = product.find('h2').text().trim();
    const link = ('https://www.vea.com.ar' +
      product.find('a').attr('href')) as string;

    const price = fixStringNumber(
      product
        .find('.vtex-flex-layout-0-x-flexRow--sellingPrice-discount ')
        .text()
        .replace('$', ''),
    );

    const image = product.find('img').attr('src') as string;

    products.push({ title, price, image, link, market: 'vea' });
  });

  return products;
}
async function getDiscoProducts(page: Page, browser: Browser) {
  const products: Product[] = [];

  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });

  await page.$$eval('producto .item', (images) => {
    images.forEach(async (img) => {
      img.scrollIntoView();
      await page.waitForTimeout(3000);
    });
  });

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  $('.vtex-search-result-3-x-galleryItem').each((index, el) => {
    const product = $(el);

    const title = product.find('h2').text();
    const link = ('https://www.disco.com.ar' +
      product.find('a').attr('href')) as string;

    const price = fixStringNumber(
      product.find('.contenedor-precio').text().replace('$', ''),
    );

    const image = product.find('img').attr('src') as string;

    products.push({ title, price, image, link, market: 'disco' });
  });

  return products;
}
async function getJumboProducts(page: Page, browser: Browser) {
  const products: Product[] = [];

  if (await page.$(".empty-search-message")) return products;

  await page.click('[title="Más relevantes"]');

  await page.waitForSelector(".select2-results__options li:nth-child(3)", {
    visible: true,
  });
  await page.click(".select2-results__options li:nth-child(3)");

  await page.waitForNetworkIdle();
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  $(".product-shelf .gotten-product-item-data").each((index, el) => {
    const product = $(el);
    const title = product.find(".product-item__name a").text();
    const link = product.find(".product-item__name a").attr("href") as string;
    const price = product.find(".product-prices__value--best-price ")
      ? fixStringNumber(product.find(".product-prices__value--best-price").text().replace("$", ""))
      : undefined;

    const image = product.find("img").attr("src") as string;

    if (price) products.push({title, price, image, link, market: "jumbo"});
  });

  return products;
}
async function getCarrefourProducts(page: Page, browser: Browser) {
  const products: Product[] = [];

  if (await page.$(".back-button")) return products;

  const currentURL = await page.url();

  if (!currentURL.includes("order=OrderByPriceASC")) {
    const sortedUrl = currentURL.includes("order=")
      ? currentURL.replace("order=", "order=OrderByPriceASC")
      : `${currentURL}?order=OrderByPriceASC´`;

    await page.goto(sortedUrl, {timeout: 0, waitUntil: "networkidle2"});

    await page.waitForSelector(".vtex-product-summary-2-x-brandName", {
      visible: true,
      timeout: 0,
    });
  }
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  $(".vtex-product-summary-2-x-element").each((index, el) => {
    const product = $(el);
    const title = product.find(".vtex-product-summary-2-x-brandName").text();
    const link = ("https://www.carrefour.com.ar" +
      product.find(".vtex-product-summary-2-x-clearLink").attr("href")) as string;
    const price = product.find(".lyracons-carrefourarg-product-price-1-x-currencyContainer")
      ? fixStringNumber(
          product
            .find(".lyracons-carrefourarg-product-price-1-x-currencyContainer")
            .text()
            .replace("$", "")
            .trim(),
        )
      : undefined;

    const image = product.find("img").attr("src") as string;

    if (price) products.push({title, price, image, link, market: "carrefour"});
  });

  return products;
}
async function getCotoProducts(page: Page, browser: Browser) {
  const products: Product[] = [];

  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  $("#products li").each((index, el) => {
    const product = $(el);
    const title = product.find(".span_productName .descrip_full").text();
    const link =
      "https://www.cotodigital3.com.ar" + product.find(".product_info_container a").attr("href");
    const matchPrice = product
      .find(".atg_store_newPrice")
      .text() // eslint-disable-next-line
      .match(/[\d\.]+/g) as string[];

    const price = fixStringNumber(matchPrice.join(","));

    const image = product.find(".atg_store_productImage img").attr("src") as string;

    if (title) products.push({title, price, image, link, market: "coto"});
  });

  return products;
}
async function getMaxiProducts(page: Page, browser: Browser) {
  const products: Product[] = [];

  await page.waitForSelector('[data-value="asc"],.notice', {timeout: 0});
  if (await page.$(".notice")) return products;
  await page.click('[data-value="asc"]');
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  $(".product-item-info").each((index, el) => {
    const product = $(el);
    const title = product.find(".product-item-name").text().trim();
    const link = product.find(".product-item-link").first().attr("href") as string;
    const price = !product.find('[data-price-type="finalPrice"]')
      ? undefined
      : fixStringNumber(
          product.find('[data-label="con iva"]').text().replace("$", "").replace("\n", "").trim(),
        );

    const image = product.find(".product-image-photo").attr("src") as string;

    if (price) {
      products.push({title, price, image, link, market: "maxiconsumo"});
    }
  });

  return products;
}

async function getSupermamiProducts(html: string) {
  const $ = await cheerio.load(html, null, false);
  const products: Product[] = [];

  $(".product").each((index, el) => {
    const product = $(el);
    const title = product.find(".description ").text().trim();
    const link = "https://www.dinoonline.com.ar" + product.find(".image a").attr("href");
    const matchPrice: string[] | undefined = product.find(".precio-unidad span")
      ? (product
          .find(".precio-unidad span")
          .text() // eslint-disable-next-line
          .match(/[\d\.]+/g) as string[])
      : undefined;

    const price = matchPrice?.length ? fixStringNumber(matchPrice.join(",")) : undefined;

    const image = product.find(".image img").attr("src") as string;

    if (price) {
      products.push({title, price, image, link, market: "super mami"});
    }
  });

  return products;
}
async function getDiaProducts(html: string) {
  const $ = await cheerio.load(html, null, false);
  const products: Product[] = [];

  $(
    '#gallery-layout-container .vtex-product-summary-2-x-clearLink--shelf',
  ).each((index, el) => {
    const product = $(el);
    const title = product
      .find('.vtex-product-summary-2-x-brandName')
      .text()
      .trim();
    const link = product.find(product).attr('href') as string;
    const foundPrice = product.find('.vtex-product-price-1-x-sellingPrice');
    const price = !foundPrice
      ? undefined
      : fixStringNumber(foundPrice.text().replace('$', '').replace('.', ''));

    const image = product
      .find('.vtex-product-summary-2-x-image')
      .attr('src') as string;

    if (price) products.push({ title, price, image, link, market: 'dia' });
  });

  return products.sort(function (a, b) {
    return a.price - b.price;
  });
}

async function getProducts(market: string, search: string) {
  const formattedKeyword = search.trim().toLowerCase().replaceAll(" ", "%20");
  const chacheKey = `${market}-${formattedKeyword}`;

  const cache = await get(chacheKey);

  if (cache) return cache;

  const searchUrl = getSearchUrl(market, formattedKeyword);
  const {page, browser} = await configureBrowser(searchUrl);

  try {
    const products = await getMarketProducts(market, page, browser);

    /// caching response ///
    await saveWithTtl(
      chacheKey,
      products,
      parseInt(process.env.PRODUCTS_CACHE_REVALIDATION_INTERVAL_S || "21600"),
    );

    return products;
  } catch (error) {
    console.log(error);
    browser.disconnect();
    browser.close();
  }
}

export default getProducts;
