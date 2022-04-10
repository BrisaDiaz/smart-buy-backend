"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const redis_1 = require("./lib/redis");
(0, redis_1.connectRedis)();
app_1.default.listen(app_1.default.get("port"), app_1.default.get("host"), () => {
    console.log(`Server running at http://${app_1.default.get("host")}:${app_1.default.get("port")}`);
});
//# sourceMappingURL=index.js.map