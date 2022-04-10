import httpStatus from "http-status";
import {Request, Response} from "express";

import {MARKETS} from "../constants";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import getProducts from "../services/getProducts";

export const getMarketProducts = catchAsync(async (req: Request, res: Response) => {
  const {query, market}: {query?: string; market?: string[] | string} = req.query;

  if (!query) throw new ApiError(httpStatus.BAD_REQUEST, "empty search query");
  if (!market) throw new ApiError(httpStatus.BAD_REQUEST, "empty market query");

  if (Array.isArray(market)) {
    const isValidMarket = market.every((current) => MARKETS.includes(current));

    if (!isValidMarket) throw new ApiError(httpStatus.BAD_REQUEST, "invalid markets");
    const promises = market.map((market) => getProducts(market, query));
    const results = await Promise.all(promises);

    const products = results.flat().sort(function (a, b) {
      return a.price - b.price;
    });

    res.json({products, total: products.length});
  }
  const isValidMarket = MARKETS.includes(market as string);

  if (!isValidMarket) throw new ApiError(httpStatus.BAD_REQUEST, "invalid market");
  const products = await getProducts(market as string, query);

  res.json({products, total: products?.length});
});
