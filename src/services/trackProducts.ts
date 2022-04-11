import dotenv from "dotenv";
import {CronJob} from "cron";

import {Product} from "../interfaces";
import {
  getProductByLink,
  getProductPricesByLink,
  addProduct,
  updateProductPrice,
} from "../lib/firebase";

import getProductPrice from "./getProductPrice";
dotenv.config({path: ".env"});

export async function initProductTrack(product: Product) {
  const productFound = await getProductByLink(product.link);

  if (productFound) return productFound;
  const createdProduct = await addProduct(product);

  makePeriodicPriceUpdates(product.link, product.market);

  return createdProduct;
}

export async function getProductTrackedPrices(link: string) {
  const foundProduct = await getProductPricesByLink(link);

  return foundProduct;
}

function makePeriodicPriceUpdates(link: string, market: string) {
  const job = new CronJob(process.env.PRICE_CHECK_CRON_INTERVAL || "0 */6 * * *", async () => {
    try {
      const currentPrice = await getProductPrice(link, market);
      const foundProduct = await getProductByLink(link);

      if (currentPrice && foundProduct) {
        await updateProductPrice(foundProduct.id, currentPrice);
      }
    } catch (e) {
      console.log(e);
    }
  });

  job.start();
}
