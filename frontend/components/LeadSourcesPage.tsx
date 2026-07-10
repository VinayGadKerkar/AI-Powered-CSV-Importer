"use client";

import { useState } from "react";
import ImportModal from "./ImportModal";
import { ImportResult } from "./types";
import ResultsTable from "./ResultsTable";

export default function LeadSourcesPage() {
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState<ImportResult | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleImportComplete = (data: ImportResult) => {
    setResults(data);
    setShowModal(false);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-950 dark:bg-gray-950">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h1 className="text-xl font-semibold text-white">Lead Sources</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage and import your lead sources
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: "#e94560" }}
            >
              <span>+</span>
              Import Leads via CSV
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {results ? (
            <ResultsTable results={results} onImportMore={() => setShowModal(true)} />
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl mb-5">
                📋
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                No leads imported yet
              </h2>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                Import your first batch of leads by uploading a CSV file. Our
                AI will automatically map your columns to the CRM fields.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: "#e94560" }}
              >
                Import Leads via CSV
              </button>
            </div>
          )}
        </div>

        {/* Import Modal */}
        {showModal && (
          <ImportModal
            onClose={() => setShowModal(false)}
            onImportComplete={handleImportComplete}
          />
        )}
      </div>
    </div>
  );
}
