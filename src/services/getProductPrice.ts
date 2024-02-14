import puppeteer, {Page, Browser} from "puppeteer";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

import fixStringNumber from "../utils/fixStringNumber";

dotenv.config({path: ".env"});

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
  "--headless",
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

  page.setViewport({width: 1366, height: 768});
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  await page.setRequestInterception(true);

  page.on("request", async (request) => {
    if (
      request.resourceType() === "stylesheet" ||
      request.resourceType() === "image" ||
      request.resourceType() === "media" ||
      request.url().includes("google")
    )
      await request.abort();
    else await request.continue();
  });

  return {page, browser};
}

async function getMarketProductPrice(market: string, page: Page, browser: Browser) {
  if (market === "jumbo") return getJumboProductPrice(page, browser);
  if (market === "carrefour") return getCarrefourProductPrice(page, browser);
  if (market === "coto") return getCotoProductPrice(page, browser);
  if (market === "disco") return getDiscoProductPrice(page, browser);
  if (market === "vea") return getVeaProductPrice(page, browser);

  if (market === "cordiez") return getCordiezProductPrice(page, browser);
  if (market === "hiperlibertad") return getHiperlibertadProductPrice(page, browser);
  if (market === "maxiconsumo") return getMaxiProductPrice(page, browser);
  if (market === "super mami") return getSupermamiProductPrice(page, browser);
  if (market === "dia") return getDiaProductPrice(page, browser);
  if (market === "la anonima online") return getAnonimaPrice(page, browser);
}
async function getCordiezProductPrice(page: Page, browser: Browser) {
  const priceSelector = ".offer-price";
  const notFoundSelector = ".resultado-busca";

  await page.waitForSelector(`${priceSelector}, ${notFoundSelector}`);
  if (await page.$(notFoundSelector)) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  const price = fixStringNumber($(priceSelector).first().text().replace("$", "").replace(".", ""));

  return price;
}
async function getHiperlibertadProductPrice(page: Page, browser: Browser) {
  const priceSelector = ".vtex-product-price-1-x-currencyContainer--pdp-selling-price";
  const notFoundSelector = ".vtex-flex-layout-0-x-flexRowContent--not-found-product-container";

  await page.waitForSelector(`${priceSelector}, ${notFoundSelector}`);
  if (await page.$(notFoundSelector)) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);
  const price = fixStringNumber($(priceSelector).first().text().replace("$", "").replace(".", ""));

  return price;
}

async function getVeaProductPrice(page: Page, browser: Browser) {
  const priceSelector = ".vtex-flex-layout-0-x-flexRowContent--mainRow-price-box span";
  const notFoundSelector = ".vtex-flex-layout-0-x-flexRowContent--row-opss-notfound";

  await page.waitForSelector(`${priceSelector}, ${notFoundSelector}`);
  if (await page.$(notFoundSelector)) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);
  const price = fixStringNumber($(priceSelector).first().text().replace("$", "").replace(".", ""));

  return price;
}
async function getDiscoProductPrice(page: Page, browser: Browser) {
  const priceSelector = ".vtex-flex-layout-0-x-flexRowContent--mainRow-price-box span";
  const notFoundSelector = ".vtex-flex-layout-0-x-flexRow--not-found-page";

  await page.waitForSelector(`${priceSelector}, ${notFoundSelector}`);
  if (await page.$(notFoundSelector)) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);
  const priceContainer = $(priceSelector);
  const price = priceContainer
    ? fixStringNumber(priceContainer.first().text().replace("$", ""))
    : undefined;

  return price;
}
async function getJumboProductPrice(page: Page, browser: Browser) {
  const priceSelector = ".vtex-flex-layout-0-x-flexColChild--shelf-main-price-box span";
  const notFoundSelector = ".vtex-flex-layout-0-x-flexRowContent--row-opss-notfound";

  await page.waitForSelector(`${priceSelector}, ${notFoundSelector}`);
  if (await page.$(notFoundSelector)) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);
  const price = fixStringNumber($(priceSelector).text().replace("$", ""));

  return price;
}
async function getCarrefourProductPrice(page: Page, browser: Browser) {
  const priceSelector = ".valtech-carrefourar-product-price-0-x-currencyContainer";
  const notFoundSelector = ".vtex-flex-layout-0-x-flexRowContent--homeRowContent";

  await page.waitForSelector(`${priceSelector}, ${notFoundSelector}`);
  if (await page.$(notFoundSelector)) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);

  const price = fixStringNumber($(priceSelector).text().replace("$", "").replace(".", ""));

  return price;
}
async function getCotoProductPrice(page: Page, browser: Browser) {
  const priceSelector = ".atg_store_newPrice";

  await page.waitForSelector(priceSelector);

  if (!(await page.$(priceSelector))) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  const matchPrice = $(priceSelector).first().text().trim().replace("$", "").replace(".", "");

  return fixStringNumber(matchPrice);
}
async function getMaxiProductPrice(page: Page, browser: Browser) {
    const priceSelector = "[data-price-type='finalPrice']  .price";
  const notFoundSelector = ".img-404";

  await page.waitForSelector(`${priceSelector}, ${notFoundSelector}`);
  if (await page.$(notFoundSelector)) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);

  const price = fixStringNumber($(priceSelector).first().text().replace("$", "").replace(".", ""));

  return price;
}

async function getSupermamiProductPrice(page: Page, browser: Browser) {
  await page.waitForSelector('[id="productLandingPage"]');
  if (!(await page.$('[id="productLandingPage"]'))) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);
  const price = fixStringNumber(
    $('[id="productLandingPage"]')
      .find(".precio-unidad span")
      .text()
      .replace("$", "")
      .replace(".", ","),
  );

  return price;
}
async function getDiaProductPrice(page: Page, browser: Browser) {
  await page.waitForSelector(".contenedor-precio , .render-route-store-not-found-product");
  if (await page.$(".render-route-store-not-found-product")) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);
  const price = fixStringNumber($(".contenedor-precio span").first().text().replace("$", ""));

  return price;
}
async function getAnonimaPrice(page: Page, browser: Browser) {
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);
  const price =
    $("span.precio").length > 0
      ? fixStringNumber($("span.precio").first().text().replace("$", "").trim())
      : undefined;

  return price;
}

export default async function getProductPrice(productLink: string, market: string) {
  const {page, browser}: {page: Page; browser: Browser} = await configureBrowser(productLink);

  try {
    const price = await getMarketProductPrice(market, page, browser);

    return typeof price === "number" ? price : undefined;
  } catch (error) {
    browser.disconnect();
    browser.close();
  }
}
