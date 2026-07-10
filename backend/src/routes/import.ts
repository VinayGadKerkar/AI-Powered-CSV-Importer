import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { parseCSV } from "../utils/csvParser";

const router = Router();

// Multer config — memory storage, 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// Handle multer errors (file too large, wrong type)
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ error: "File too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

router.post(
  "/import",
  uploadMiddleware,
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please attach a CSV file." });
    }

    try {
      const csvContent = req.file.buffer.toString("utf-8");
      const rows = await parseCSV(csvContent);

      // Commit 3: return raw rows. AI extraction added in Commit 4.
      return res.json({
        rows,
        total: rows.length,
        message: "CSV parsed successfully (AI extraction pending)",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: "Failed to process CSV", message });
    }
  }
);

export default router;
