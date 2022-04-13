import dotenv from "dotenv";

import {saveWithTtl, get} from "../lib/redis";
import {Product} from "../interfaces";
import {
  getProductByLink,
  getProductPriceHistory,
  addProduct,
  updateProductPrice,
} from "../lib/firebase";

import getProductPrice from "./getProductPrice";
dotenv.config({path: ".env"});

export async function initProductTrack(product: Product) {
  const productFound = await getProductByLink(product.link);

  if (productFound) return productFound;
  const createdProduct = await addProduct(product);

  return createdProduct;
}

export async function getProductTrackedPrices(link: string, price?: number) {
  const key = `${link}-${price}`;

  const cacheData = await get(key);

  if (cacheData) return cacheData;

  const product = await getProductByLink(link);

  if (!product) return undefined;
  const currentPrice = price || (await getProductPrice(link, product.market));

  if (product.price - currentPrice !== 0) await makePriceUpdates(product.id, currentPrice);
  const priceHistory = await getProductPriceHistory(product.id);

  const data = {product, priceHistory};

  await saveWithTtl(
    key,
    data,
    parseInt(process.env.TRACKED_PRODUCT_CACHE_REVALIDATION_INTERVAL_S || "21600"),
  );

  return data;
}

async function makePriceUpdates(productId: string, currentPrice: number) {
  try {
    await updateProductPrice(productId, currentPrice);
  } catch (e) {
    console.log(e);
  }
}
