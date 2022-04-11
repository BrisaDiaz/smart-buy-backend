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
// enable cors

const app = express();

if (process.env.NODE_ENV === "production") {
  const whitelist = ["https://smart-buy.vercel.app"];
  const corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new ApiError(httpStatus.FORBIDDEN, "Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,POST",
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
} else {
  app.use(cors());
}
app.use(morgan("tiny"));
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({extended: true}));

// sanitize request data
app.use(xss());

app.set("port", process.env.PORT || 4000);
app.set("host", process.env.HOST || "0.0.0.0");
app.use("/api/v1", routes);
app.use("/", (req, res) => {
  return res.send("welcome to Smart buy");
});
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

export default app;
