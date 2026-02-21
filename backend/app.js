import express from "express";
// import dotenv from "dotenv";
// dotenv.config({ quiet: true });
import 'dotenv/config';
import postsRouter from "./modules/posts/posts.routes.js";
import galleryRouter from "./modules/galleries/gallery.routes.js";
import usersRouter from "./modules/users/users.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import error from "./middlewares/system/error.middleware.js";
import notFound from "./middlewares/system/notFound.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as rateLimters from "./utils/rateLimiters.js";
import './lib/cloudinary/config.js'

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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
// app.use(express.urlencoded({extended:true, limit: '2mb'}))
app.use(cookieParser());
app.use("/public-route", express.static(join(__dirname, "public")));

app.use("/api/v1/posts", rateLimters.limiter, postsRouter);
app.use("/api/v1/galleries", rateLimters.limiter, galleryRouter);
app.use("/api/v1/users", rateLimters.limiter, usersRouter);
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(error);
app.use(notFound);

export default app;
