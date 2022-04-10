"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const market_route_1 = __importDefault(require("./market.route"));
const tracker_route_1 = __importDefault(require("./tracker.route"));
const docs_route_1 = __importDefault(require("./docs.route"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../../..", ".env") });
const router = express_1.default.Router();
const defaultRoutes = [
    {
        path: "/market",
        route: market_route_1.default,
    },
    {
        path: "/tracker",
        route: tracker_route_1.default,
    },
];
const devRoutes = [
    {
        path: "/docs",
        route: docs_route_1.default,
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
exports.default = router;
//# sourceMappingURL=index.js.map