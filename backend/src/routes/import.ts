import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { parseCSV } from "../utils/csvParser";
import { extractCRMRecords } from "../services/aiExtractor";

const router = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Multer — memory storage, 5MB limit, CSV only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const isCSV =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");

    if (isCSV) {
      cb(null, true);
    } else {
      cb(new Error("Only .csv files are supported."));
    }
  },
});

// Middleware — intercepts multer errors before they hit Express default handler
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "File too large.",
          message: "Maximum allowed size is 5MB.",
        });
      }
      return res.status(400).json({ error: "Upload error.", message: err.message });
    }
    if (err instanceof Error) {
      return res.status(400).json({ error: "Invalid file.", message: err.message });
    }
    next();
  });
};

/**
 * POST /api/import
 * Accepts a multipart CSV upload (field name: "file").
 * Parses headers dynamically, then runs Mistral AI extraction.
 * Returns: { imported, skipped, total_imported, total_skipped }
 */
router.post("/import", uploadMiddleware, async (req: Request, res: Response) => {
  // Validate file presence
  if (!req.file) {
    return res.status(400).json({
      error: "No file uploaded.",
      message: "Please attach a CSV file using the 'file' field.",
    });
  }

  // Validate extension (belt-and-suspenders)
  if (!req.file.originalname.toLowerCase().endsWith(".csv")) {
    return res.status(400).json({
      error: "Invalid file type.",
      message: "Only .csv files are accepted.",
    });
  }

  // Validate file is non-empty
  if (req.file.size === 0) {
    return res.status(400).json({
      error: "Empty file.",
      message: "The uploaded CSV file is empty.",
    });
  }

  try {
    // Step 1: Parse CSV dynamically — no fixed column assumptions
    const csvContent = req.file.buffer.toString("utf-8");
    const rows = await parseCSV(csvContent);

    if (rows.length === 0) {
      return res.status(400).json({
        error: "No data found.",
        message: "The CSV file contains headers but no data rows.",
      });
    }

    console.log(
      `📂 Parsed CSV: ${rows.length} rows, columns: [${Object.keys(rows[0] || {}).join(", ")}]`
    );

    // Step 2: Run Mistral AI extraction
    const result = await extractCRMRecords(rows);

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Import error:", message);
    return res.status(500).json({
      error: "Failed to process CSV.",
      message,
    });
  }
});

export default router;
