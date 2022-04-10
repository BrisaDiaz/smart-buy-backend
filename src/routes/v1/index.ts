import express from "express";
import dotenv from "dotenv";

import marketRoute from "./market.route";
import trackerRoute from "./tracker.route";
import docsRoute from "./docs.route";
dotenv.config({path: ".env"});

const router = express.Router();

const defaultRoutes = [
  {
    path: "/market",
    route: marketRoute,
  },
  {
    path: "/tracker",
    route: trackerRoute,
  },
];
const devRoutes = [
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (process.env.NODE_ENV === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
