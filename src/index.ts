import app from "./app";
import {connectRedis} from "./lib/redis";
connectRedis();

app.listen(app.get("port"), app.get("host"), () => {
  console.log(`Server running at http://${app.get("host")}:${app.get("port")}`);
});
