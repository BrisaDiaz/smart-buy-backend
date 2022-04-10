import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import httpStatus from "http-status";
import morgan from "morgan";

import ApiError from "./utils/ApiError";
import routes from "./routes/v1";
dotenv.config({path: ".env"});

const app = express();

app.use(morgan("tiny"));
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({extended: true}));

// sanitize request data
app.use(xss());

 
const whitelist = ["https://smart-buy.vercel.app", "http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new ApiError(httpStatus.FORBIDDEN, "Not allowed by CORS"));
    }
  },
};
// enable cors
app.use(cors(corsOptions));

app.set("port", process.env.APP_PORT || 4000);
app.set("host", process.env.APP_HOST || "localhost");
app.use("/api/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

export default app;
