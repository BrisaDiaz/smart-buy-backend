"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../../controllers");
const router = express_1.default.Router();
router.get("/products", controllers_1.getTrackedProduct);
router.post("/products", controllers_1.trackProduct);
exports.default = router;
//# sourceMappingURL=tracker.route.js.map