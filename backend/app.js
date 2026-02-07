import express from "express";
import dotenv from "dotenv";
import postsRouter from "./routes/api/posts.routes.js";
import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import error from "./middlewares/system/error.middleware.js";
import notFound from "./middlewares/system/notFound.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as rateLimters from "./utils/rateLimiters.js";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ quiet: true });

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/public-route", express.static(join(__dirname, "public")));

app.use("/api/v1/posts", rateLimters.limiter, postsRouter);
app.use("/api/v1/users", rateLimters.limiter, usersRouter);
app.use("/api/v1/auth", rateLimters.loginLimiter, authRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(error);
app.use(notFound);

export default app;
