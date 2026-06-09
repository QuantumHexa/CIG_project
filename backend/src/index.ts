import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./lib/env.js";
import { ensureUploadDir } from "./services/storage.js";
import { setSocketServer } from "./services/notifications.js";
import { authRouter } from "./routes/auth.js";
import { eventsRouter } from "./routes/events.js";
import { mediaRouter } from "./routes/media.js";
import { notificationsRouter } from "./routes/notifications.js";
import { usersRouter } from "./routes/users.js";
import { shareRouter } from "./routes/share.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: env.clientUrl, credentials: true },
});

setSocketServer(io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return next(new Error("Auth required"));
  try {
    const user = jwt.verify(token, env.jwtSecret) as { id: string };
    socket.join(`user:${user.id}`);
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large (max 50MB per file)" });
  }
  next(err);
});
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", s3: Boolean(env.aws.bucket) });
});

app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/media", mediaRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/share", shareRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
);

async function start() {
  await ensureUploadDir();
  server.listen(env.port, () => {
    console.log(`API running at http://localhost:${env.port}`);
  });
}

start();
