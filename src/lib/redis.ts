import {createClient} from "redis";
import dotenv from "dotenv";

dotenv.config({path: ".env"});
const client = createClient({
  url: `redis://default:${process.env.REDIS_DATABASE_PASSWORD}@${process.env.REDIS_DATABASE_ENDPOINT}`,
});

client.on("error", (err) => {
  console.log("Error " + err);
});
client.on("connect", () => {
  console.log("redis connected successfully");
});

export async function get(key: string) {
  const jsonString = await client.get(key);

  if (jsonString) {
    return JSON.parse(jsonString);
  }
}
export async function saveWithTtl(key: string, value: unknown, ttlSeconds: number) {
  return await client.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
    NX: true,
  });
}

export const connectRedis = async () => await client.connect();
export const disconnectRedis = async () => await client.disconnect();
