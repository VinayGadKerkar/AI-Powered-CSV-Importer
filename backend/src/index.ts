import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import importRoutes from "./routes/import";
import healthRoutes from "./routes/health";

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

// Build allowed origins list — always include localhost for local dev
const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://localhost:3001",
];

// Add any configured FRONTEND_URL values (comma-separated for multiple)
if (FRONTEND_URL) {
  FRONTEND_URL.split(",")
    .map((u) => u.trim().replace(/\/$/, "")) // strip trailing slash
    .filter(Boolean)
    .forEach((u) => allowedOrigins.push(u));
}

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, Railway health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In production with no FRONTEND_URL configured, allow all (open CORS)
      // Remove this block once FRONTEND_URL is properly set on Railway
      if (!FRONTEND_URL) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Handle preflight OPTIONS requests
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", healthRoutes);
app.use("/api", importRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found." });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.stack || err.message);
  res.status(500).json({
    error: "Internal server error.",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(", ")}`);
});

export default app;
