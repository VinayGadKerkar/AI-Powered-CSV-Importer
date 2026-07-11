"use client";

import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { ImportResult, ModalStep } from "./types";
import CSVPreviewTable from "./CSVPreviewTable";

interface Props {
  onClose: () => void;
  onImportComplete: (data: ImportResult) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadSampleCSV() {
  const csvContent = [
    "Full Name,Phone,Email Address,Organization,City,Province,Nation,Status,Notes,Date Added,Owner,Source",
    "Alice Johnson,+91-9876543210,alice@example.com,TechCorp Pvt Ltd,Mumbai,Maharashtra,India,Interested,Called twice — follow up next week,2024-01-15,ravi@groweasy.com,meridian_tower",
    "Bob Smith,9812345678,bob.smith@gmail.com,Retail Hub,Delhi,Delhi,India,Not Contacted,,2024-01-16,priya@groweasy.com,eden_park",
    "Carol White,+44 7700 900123,carol@white.co.uk,White Enterprises,London,,UK,Closed Deal,,2024-01-17,carol@groweasy.com,",
    "David Lee,,david.lee@company.in,Lee & Sons,Bangalore,Karnataka,India,Bad Lead,Wrong number,2024-01-18,amit@groweasy.com,sarjapur_plots",
    "Eve Martinez,+1-555-0199,eve@domain.com,,New York,NY,USA,Follow Up,Interested in Q2 project,2024-01-19,john@groweasy.com,varah_swamy",
    "Frank Nguyen,8877665544,frank.nguyen@biz.com,Nguyen Trading,Ho Chi Minh City,,Vietnam,Did Not Pick,,2024-01-20,ravi@groweasy.com,",
    "Grace Kim,+82-10-1234-5678,grace@kim.kr,Kim Corp,Seoul,,South Korea,Sale Done,Deal closed — payment received,2024-01-21,priya@groweasy.com,leads_on_demand",
    "Hank Patel,9900112233,hank.patel@patel.in,Patel Builders,Ahmedabad,Gujarat,India,Interested,,2024-01-22,amit@groweasy.com,sarjapur_plots",
    "Irene Wong,+65 9111 2222,irene@wong.sg,Wong Solutions,Singapore,,Singapore,Not Contacted,,2024-01-23,john@groweasy.com,meridian_tower",
    "Jake Brown,7766554433,,Brown & Co,,,,Bad Lead,No email provided,2024-01-24,ravi@groweasy.com,",
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample_leads_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportModal({ onClose, onImportComplete }: Props) {
  const [step, setStep] = useState<ModalStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFileForPreview = useCallback((f: File) => {
    Papa.parse<Record<string, string>>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data;
        setPreviewHeaders(headers);
        setTotalRows(rows.length);
        setPreviewData(rows.slice(0, 20));
        setStep("preview");
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  }, []);

  const handleFileSelect = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are supported.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB limit.");
      return;
    }
    setError(null);
    setFile(f);
    parseFileForPreview(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setStep("loading");
    setError(null);
    setBatchProgress("Sending file to server...");

    const formData = new FormData();
    formData.append("file", file);

    // Estimate batch count for progress display
    const estimatedBatches = Math.ceil(totalRows / 20);

    // Show cycling batch progress while the single HTTP call is in-flight
    let batchNum = 1;
    const progressInterval = setInterval(() => {
      if (batchNum <= estimatedBatches) {
        setBatchProgress(`Processing batch ${batchNum} of ${estimatedBatches}...`);
        batchNum++;
      } else {
        setBatchProgress("Finalising results...");
      }
    }, Math.max(1500, (estimatedBatches * 3000) / estimatedBatches));

    try {
      const backendUrl = (
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
      ).replace(/\/$/, ""); // strip trailing slash if any

      const res = await fetch(`${backendUrl}/api/import`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Server error: ${res.status}`);
      }

      const data: ImportResult = await res.json();
      onImportComplete(data);
    } catch (err) {
      clearInterval(progressInterval);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStep("preview");
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewData([]);
    setPreviewHeaders([]);
    setTotalRows(0);
    setStep("upload");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative bg-gray-900 border border-white/10 rounded-2xl shadow-2xl
          w-full transition-all duration-300
          ${step === "preview" ? "max-w-5xl" : "max-w-lg"}
        `}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Import Leads via CSV
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === "upload" && "Upload your CSV file to get started"}
              {step === "preview" && "Review your data before importing"}
              {step === "loading" && "Processing your data with AI..."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5">
          {(["upload", "preview", "loading"] as ModalStep[]).map(
            (s, idx) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                  ${
                    step === s
                      ? "text-white"
                      : idx < ["upload", "preview", "loading"].indexOf(step)
                      ? "bg-green-500/20 text-green-400"
                      : "bg-white/5 text-gray-500"
                  }
                `}
                  style={
                    step === s ? { backgroundColor: "#e94560" } : undefined
                  }
                >
                  {idx < ["upload", "preview", "loading"].indexOf(step)
                    ? "✓"
                    : idx + 1}
                </div>
                <span
                  className={`text-xs ${step === s ? "text-white" : "text-gray-500"}`}
                >
                  {s === "upload"
                    ? "Upload"
                    : s === "preview"
                    ? "Preview"
                    : "Process"}
                </span>
                {idx < 2 && <span className="text-gray-700 text-xs">›</span>}
              </div>
            )
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
            <span className="shrink-0">⚠</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300 shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* STEP 1: Upload */}
        {step === "upload" && (
          <div className="p-6 space-y-5">
            {/* Drop zone */}
            <div
              className={`
                border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                transition-colors duration-200
                ${
                  isDragging
                    ? "border-accent bg-accent/5"
                    : "border-white/20 hover:border-white/40 hover:bg-white/5"
                }
              `}
              style={isDragging ? { borderColor: "#e94560" } : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              aria-label="Drop zone for CSV upload"
            >
              <div className="text-5xl mb-4">📂</div>
              <p className="text-white font-medium mb-1">
                Drop your CSV file here
              </p>
              <p className="text-gray-400 text-sm mb-4">
                or click to browse files
              </p>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                .csv (max 5MB)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </div>

            {/* Sample CSV download */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadSampleCSV();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              ⬇ Download Sample CSV Template
            </button>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                disabled
                className="px-5 py-2 text-sm font-medium text-white rounded-lg opacity-30 cursor-not-allowed"
                style={{ backgroundColor: "#e94560" }}
              >
                Upload File
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Preview */}
        {step === "preview" && file && (
          <div className="p-6 space-y-4">
            {/* File info */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-500 hover:text-red-400 transition-colors text-lg shrink-0"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>

            {/* Preview label */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing{" "}
                <span className="text-white font-medium">
                  {previewData.length}
                </span>{" "}
                of{" "}
                <span className="text-white font-medium">{totalRows}</span>{" "}
                rows
              </p>
              <span className="text-xs text-gray-500">
                {previewHeaders.length} columns detected
              </span>
            </div>

            {/* Table */}
            <CSVPreviewTable headers={previewHeaders} rows={previewData} />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={previewData.length === 0}
                className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#e94560" }}
              >
                Confirm Import
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Loading */}
        {step === "loading" && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            {/* Spinner */}
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full border-4 border-white/10 border-t-red-500 animate-spin"
                style={{ borderTopColor: "#e94560" }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                🤖
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-lg mb-1">
                Processing with AI...
              </p>
              <p className="text-gray-400 text-sm min-h-[20px]">
                {batchProgress || "Analyzing and mapping CSV columns to CRM fields"}
              </p>
            </div>
            {/* Batch progress bar */}
            {batchProgress.includes("batch") && (
              <div className="w-full max-w-xs">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      backgroundColor: "#e94560",
                      width: (() => {
                        const match = batchProgress.match(/batch (\d+) of (\d+)/);
                        if (match) {
                          const pct = (parseInt(match[1]) / parseInt(match[2])) * 100;
                          return `${Math.min(pct, 100)}%`;
                        }
                        return "90%";
                      })(),
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{batchProgress}</p>
              </div>
            )}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#e94560",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
