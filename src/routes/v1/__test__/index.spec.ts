import supertest from "supertest";

import app from "../../../app";
import {connectRedis, disconnectRedis} from "../../../lib/redis";
describe("/market/search GET", () => {
  it("returns bad request if first market query is missing", async () => {
    const res = await supertest(app).get("/api/v1/market/search?query=mayonesa");

    expect(res.statusCode).toEqual(400);
    expect(res.text.includes("Error: empty market query")).toEqual(true);
  });

  it("returns bad request if first search query is missing", async () => {
    const res = await supertest(app).get("/api/v1/market/search?market=vea");

    expect(res.statusCode).toEqual(400);

    expect(res.text.includes("Error: empty search query")).toEqual(true);
  });
  it("returns bad request if market is not valid", async () => {
    const res = await supertest(app).get("/api/v1/market/search?query=mayonesa&market=amazon");

    expect(res.statusCode).toEqual(400);

    expect(res.text.includes("Error: invalid market")).toEqual(true);
  });
  it("returns object containing products and total when is a valid request", async () => {
    await connectRedis();
    const res = await supertest(app).get("/api/v1/market/search?query=mayonesa&market=vea");

    await disconnectRedis();
    expect(res.statusCode).toEqual(200);

    expect(Array.isArray(res.body.products) && typeof res.body.total === "number").toEqual(true);
  });
});

describe("/traker/products  POST", () => {
  it("returns bad request if posted product  doesn't contains all required props", async () => {
    const res = await supertest(app)
      .post("/api/v1/tracker/products ")
      .send({
        product: {
          title: "Mayonesa Hellmanns Clasica  X237g",
          price: 132,
          image: {
            src: "https://jumboargentina.vtexassets.com/arquivos/ids/687731-500-auto?v=637799529681900000&width=500&height=auto&aspect=true",
            alt: "Mayonesa Hellmanns Clasica  X237g",
          },
        },
      });

    expect(res.statusCode).toEqual(400);
    expect(res.text.includes("Error: Invalid product schema")).toEqual(true);
  });
  it("returns bad request if posted product  doesn't not contains a valid market", async () => {
    const res = await supertest(app)
      .post("/api/v1/tracker/products ")
      .send({
        product: {
          title: "Mayonesa Hellmanns Clasica  X237g",
          price: 132,
          image: {
            src: "https://jumboargentina.vtexassets.com/arquivos/ids/687731-500-auto?v=637799529681900000&width=500&height=auto&aspect=true",
            alt: "Mayonesa Hellmanns Clasica  X237g",
          },
          link: "https://www.vea.com.ar/mayonesa-hellmanns-clasica-x237g/p",
          market: "amazon",
        },
      });

    expect(res.statusCode).toEqual(400);
    expect(res.text.includes("Error: invalid market")).toEqual(true);
  });
  it("create a tracking product document or returns found product with same link", async () => {
    const res = await supertest(app)
      .post("/api/v1/tracker/products ")
      .send({
        product: {
          title: "Mayonesa Hellmanns Clasica  X237g",
          price: 132,
          image: {
            src: "https://jumboargentina.vtexassets.com/arquivos/ids/687731-500-auto?v=637799529681900000&width=500&height=auto&aspect=true",
            alt: "Mayonesa Hellmanns Clasica  X237g",
          },
          link: "https://www.vea.com.ar/mayonesa-hellmanns-clasica-x237g/p",
          market: "vea",
        },
      });

    expect(res.statusCode).toEqual(201);
    expect(Object.prototype.hasOwnProperty.call(res.body, "id")).toEqual(true);
  });
});
describe("/traker/products  GET", () => {
  it("returns bad request  if link query is an invalid url", async () => {
    const res = await supertest(app).get(
      "/api/v1/tracker/products?link=mayonesa-hellmann-s-light-237-g-doypack/p",
    );

    expect(res.statusCode).toEqual(400);
    expect(res.text.includes("Error: Invalid link")).toEqual(true);
  });

  it("returns not found response  no tracked product with the link is found", async () => {
    const res = await supertest(app).get(
      "/api/v1/tracker/products?link=https://www.vea.com.ar/mayonesa",
    );

    expect(res.statusCode).toEqual(404);
    expect(res.text.includes("Error: No product with the provided link was found")).toEqual(true);
  });
  it("returns bad request  not link query is provided", async () => {
    const res = await supertest(app).get("/api/v1/tracker/products");

    expect(res.statusCode).toEqual(400);
    expect(res.text.includes("Error: The product link wast not provided")).toEqual(true);
  });
  it("returns tracking product with priceHistory when found", async () => {
    const res = await supertest(app).get(
      "/api/v1/tracker/products?link=https://www.vea.com.ar/mayonesa-hellmann-s-light-237-g-doypack/p",
    );

    expect(res.statusCode).toEqual(200);
    expect(Object.prototype.hasOwnProperty.call(res.body, "product")).toEqual(true);
    expect(Object.prototype.hasOwnProperty.call(res.body, "priceHistory")).toEqual(true);
  });
});
