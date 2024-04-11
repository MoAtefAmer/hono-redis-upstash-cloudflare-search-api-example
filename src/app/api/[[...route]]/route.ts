import { Redis } from "@upstash/redis";
import { Env } from "./../../../../node_modules/hono/dist/types/types.d";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";

export const runtime = "edge";

const app = new Hono().basePath("/api");

type EnvConfig = {
  UPSTASH_REDIS_REST_TOKEN: string;
  UPSTASH_REDIS_REST_URL: string;
};

app.use('/*', cors())

app.get("/search", async (c) => {
  try {
    const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } = env<EnvConfig>(c);
    const start = performance.now();
    // ------------------------------
  

    const redis = new Redis({
      token: UPSTASH_REDIS_REST_TOKEN,
      url: UPSTASH_REDIS_REST_URL,
    });

    const query = c?.req?.query("q");
    console.log("query :>> ", query);
    if (!query) {
      return c.json(
        {
          message: "Please provide a query",
        },
        { status: 400 }
      );
    }

    const res = [];
    const rank = await redis.zrank("terms", query);


    if (rank !== null && rank !== undefined) {
      const temp = await redis.zrange<string[]>("terms", rank, rank + 100);
      console.error('temp :>> ', temp);

      for (const el of temp) {
        if (!el.startsWith(query)) {
          break;
        }

        if (el.endsWith("*")) {
          res.push(el.substring(0, el.length - 1));
        }
      }
    }
    // ------------------------------
    const end = performance.now();

    return c.json({
      results: res,
      duration: end - start,
      message: "Success!",
    });
  } catch (error) {
    console.error("error :>> ", error);
    return c.json(
      { results: [], message: "An error occurred" },
      { status: 500 }
    );
  }
});

export const GET = handle(app);
// export const POST = handle(app);

// to deploy to cloudflare, we need to export the app as never
export default app as never;
