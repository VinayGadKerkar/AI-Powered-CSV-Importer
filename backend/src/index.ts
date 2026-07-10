import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import importRoutes from "./routes/import";
import healthRoutes from "./routes/health";

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Routes
app.use("/api", healthRoutes);
app.use("/api", importRoutes);

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
