import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { driveRouter } from "./routes/drive.routes.js";
import { analysisRouter } from "./routes/analysis.routes.js";


export const app = express();

// Required when running behind a reverse proxy / tunnel / load balancer.
app.set("trust proxy", 1);

const allowedOrigins = new Set([
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
]);

app.use(requestIdMiddleware);


app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/drive", driveRouter);
app.use("/api/analysis", analysisRouter);

app.use(errorMiddleware);