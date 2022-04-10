/* eslint-disable no-useless-escape */
import httpStatus from "http-status";
import {Request, Response} from "express";

import {MARKETS, PRODUCT_PROPS} from "../constants";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import {initProductTrack, getProductTrackedPrices} from "../services/trackProducts";

export const trackProduct = catchAsync(async (req: Request, res: Response) => {
  const {product} = req.body;

  if (!product) throw new ApiError(httpStatus.BAD_REQUEST, "No product information was provided");
  const productsProps = Object.keys(product);
  const includesRequiredProps =
    productsProps.length === PRODUCT_PROPS.length &&
    productsProps.every((prop) => PRODUCT_PROPS.includes(prop));

  if (!includesRequiredProps) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product schema");
  if (!MARKETS.includes(product.market))
    throw new ApiError(httpStatus.BAD_REQUEST, "invalid market");

  const trackedProduct = await initProductTrack(product);

  res.status(201).send(trackedProduct);
});

export const getTrackedProduct = catchAsync(async (req: Request, res: Response) => {
  const {link} = req.query;

  if (typeof link !== "string")
    throw new ApiError(httpStatus.BAD_REQUEST, "The product link wast not provided");

  const isValidUrl = link.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
  );

  if (!isValidUrl) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid link");
  const results = await getProductTrackedPrices(link);

  if (!results)
    throw new ApiError(httpStatus.NOT_FOUND, "No product with the provided link was found");
  res.send(results);
});
