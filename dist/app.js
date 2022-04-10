"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
// import helmet from "helmet";
const xss_clean_1 = __importDefault(require("xss-clean"));
const cors_1 = __importDefault(require("cors"));
const http_status_1 = __importDefault(require("http-status"));
const morgan_1 = __importDefault(require("morgan"));
const ApiError_1 = __importDefault(require("./utils/ApiError"));
const v1_1 = __importDefault(require("./routes/v1"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../", ".env") });
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("tiny"));
// app.use(helmet());
// parse json request body
app.use(express_1.default.json());
// parse urlencoded request body
app.use(express_1.default.urlencoded({ extended: true }));
// sanitize request data
app.use((0, xss_clean_1.default)());
// enable cors
app.use((0, cors_1.default)());
app.options("*", (0, cors_1.default)());
app.set("port", process.env.APP_PORT || 4000);
app.set("host", process.env.APP_HOST || "localhost");
app.use("/api/v1", v1_1.default);
if (process.env.NODE_ENV === "production") {
    console.log(process.env.NODE_ENV);
    app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend", "dist")));
    app.get("/", (req, res) => {
        return res.sendFile(path_1.default.join(__dirname, "../../frontend", "dist", "index.html"));
    });
}
else {
    app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend", "src")));
}
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError_1.default(http_status_1.default.NOT_FOUND, "Not found"));
});
exports.default = app;
//# sourceMappingURL=app.js.map