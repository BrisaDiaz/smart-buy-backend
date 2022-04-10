import express from "express";

import {getMarketProducts} from "../../controllers";
const router = express.Router();

router.get("/search", getMarketProducts);

export default router;
