import express from "express";

import {getTrackedProduct, trackProduct} from "../../controllers";
const router = express.Router();

router.get("/products", getTrackedProduct);
router.post("/products", trackProduct);

export default router;
