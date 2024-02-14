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
    process.env.NODE_ENV === 'production'
      ? {
          headless: true,
          args: minimalArgs,
        }
      : { headless: false },
  );
  const page = await browser.newPage();

  page.setViewport({ width: 1366, height: 768 });
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });
  await page.setRequestInterception(true);

  page.on('request', async (request) => {
    if (
      request.resourceType() === 'stylesheet' ||
      request.resourceType() === 'image' ||
      request.resourceType() === 'media' ||
      request.url().includes('google')
    )
      await request.abort();
    else await request.continue();
  });

  return { page, browser };
}

async function getMarketProductPrice(
  market: string,
  page: Page,
  browser: Browser,
) {
  if (market === 'jumbo') return getJumboProductPrice(page, browser);
  if (market === 'carrefour') return getCarrefourProductPrice(page, browser);
  if (market === 'coto') return getCotoProductPrice(page, browser);
  if (market === 'disco') return getDiscoProductPrice(page, browser);
  if (market === 'vea') return getVeaProductPrice(page, browser);

  if (market === 'cordiez') return getCordiezProductPrice(page, browser);
  if (market === 'hiperlibertad')
    return getHiperlibertadProductPrice(page, browser);
  if (market === 'maxiconsumo') return getMaxiProductPrice(page, browser);
  if (market === 'super mami') return getSupermamiProductPrice(page, browser);
  if (market === 'dia') return getDiaProductPrice(page, browser);
  if (market === 'la anonima online') return getAnonimaPrice(page, browser);
}
async function getCordiezProductPrice(page: Page, browser: Browser) {
  if (!(await page.$('.shop-single'))) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);

  const price = fixStringNumber(
    $('.offer-price').first().text().replace('$', ''),
  );

  return price;
}
async function getHiperlibertadProductPrice(page: Page, browser: Browser) {
  await page.waitForSelector(
    '.styles__BestPrice-ylrwvm-0, .tyles__NotFound-sc-1wrfq72-0',
  );
  if (await page.$('.tyles__NotFound-sc-1wrfq72-0')) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);
  const price = $('.contenedor-precio span')
    ? fixStringNumber(
        $(' .styles__BestPrice-ylrwvm-0').first().text().replace('$', ''),
      )
    : undefined;

  return price;
}

async function getVeaProductPrice(page: Page, browser: Browser) {
  await page.waitForSelector(
    '.contenedor-precio span, .vtex-search-result-3-x-notFound--layout',
  );
  if (await page.$('.vtex-search-result-3-x-notFound--layout')) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }
  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();
  const $ = await cheerio.load(html, null, false);
  const price = $('.contenedor-precio span')
    ? fixStringNumber(
        $(' .contenedor-precio span').first().text().replace('$', ''),
      )
    : undefined;

  return price;
}
async function getDiscoProductPrice(page: Page, browser: Browser) {
  const priceSelector =
    '.vtex-flex-layout-0-x-flexRowContent--mainRow-price-box span';
  const notFoundSelector = '.vtex-flex-layout-0-x-flexRow--not-found-page';

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
    ? fixStringNumber(priceContainer.first().text().replace('$', ''))
    : undefined;

  return price;
}
async function getJumboProductPrice(page: Page, browser: Browser) {
  await page.waitForSelector(".skuBestPrice , .empty-search-message");
  if (await page.$(".empty-search-message")) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);
  const price = fixStringNumber($(".skuBestPrice").text().replace("$", ""));

  return price;
}
async function getCarrefourProductPrice(page: Page, browser: Browser) {
  await page.waitForSelector(
    ".lyracons-carrefourarg-product-price-1-x-sellingPriceValue, .tex-flex-layout-0-x-flexRow--notFoundRow1",
  );
  if (await page.$(".tex-flex-layout-0-x-flexRow--notFoundRow1")) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);

  const price = fixStringNumber(
    $(".vtex-flex-layout-0-x-flexRow--product-view-product-main")
      .find(".lyracons-carrefourarg-product-price-1-x-sellingPrice")
      .first()
      .text()
      .replace("$", "").replace(".", ""),
  );

  return price;
}
async function getCotoProductPrice(page: Page, browser: Browser) {
  await page.waitForSelector('[id="atg_store_content"]');
  if (!(await page.$(".atg_store_newPrice"))) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);
  const matchPrice = $(".atg_store_productPrice")
    .text() // eslint-disable-next-line
    .match(/[\d\.]+/g) as string[];
  const price = fixStringNumber(matchPrice.join(""));

  return price;
}
async function getMaxiProductPrice(page: Page, browser: Browser) {
  await page.waitForSelector(".price, .wrapper_404page", {timeout: 0});

  if (await page.$(".wrapper_404page")) {
    await browser.disconnect();
    await browser.close();

    return undefined;
  }

  const html = await page.evaluate(() => document.body.innerHTML);

  await browser.disconnect();
  await browser.close();

  const $ = await cheerio.load(html, null, false);

  const price = fixStringNumber($(".price").first().text().replace("$", ""));

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
