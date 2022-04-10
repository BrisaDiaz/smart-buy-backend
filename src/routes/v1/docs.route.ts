import express from "express";
import swaggerUi from "swagger-ui-express";

import swaggerDocument from "../../docs/swagger.json";
const router = express.Router();

router.use("/", swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
  }),
);

export default router;
