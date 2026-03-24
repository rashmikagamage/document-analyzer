import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import type { HttpLogger, Options } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { driveRouter } from "./routes/drive.routes.js";
import { analysisRouter } from "./routes/analysis.routes.js";

export const app = express();

// enable later when behind a reverse proxy
// app.set("trust proxy", 1);

app.use(requestIdMiddleware);

// app.use(
//     pinoHttp({
//       logger,
//       customProps: (req) => ({
//         requestId: req.requestId,
//       }),
//     })
//   );

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

//app.use(helmet());
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