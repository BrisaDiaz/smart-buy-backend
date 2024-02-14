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

export async function updateProductPriceHistory(link: string, price?: number) {
  const product = await getProductByLink(link);

  if (!product) return undefined;
  let currentPrice: number;

  if (price) {
    currentPrice = price;
  } else {
    currentPrice = await getProductPrice(product.link, product.market);
    if (!currentPrice) {
      console.log(`Error: Current price retrial fail. link: ${product.link}`);
    }
  }

  if (currentPrice && product.price - currentPrice !== 0) {
    const newPriceRecord = await addProductPriceVariation(product.id, currentPrice);

    product.updatedAt = newPriceRecord.createdAt;
    product.price = newPriceRecord.value;
  }
  const priceHistory = await getProductPriceHistory(product.id);

  const data = {product, priceHistory};

  await saveWithTtl(
    product.link,
    data,
    parseInt(process.env.TRACKED_PRODUCT_CACHE_REVALIDATION_INTERVAL_S || "21600"),
  );

  return data;
}
export async function getProductTrackedPrices(link: string) {
  const cacheData = await get(link);

  if (cacheData) return cacheData;

  const product = await getProductByLink(link);

  if (!product) return undefined;
  const priceHistory = await getProductPriceHistory(product.id);
  const data = {product, priceHistory};

  await saveWithTtl(
    link,
    data,
    parseInt(process.env.TRACKED_PRODUCT_CACHE_REVALIDATION_INTERVAL_S || "21600"),
  );

  return data;
}
async function addProductPriceVariation(productId: string, currentPrice: number) {
  try {
    const priceRecord = await updateProductPrice(productId, currentPrice);

    return priceRecord;
  } catch (e) {
    console.log(e);
  }
}
