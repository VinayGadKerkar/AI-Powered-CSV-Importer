"use client";

import { useState } from "react";
import ImportModal from "./ImportModal";
import { ImportResult } from "./types";
import ResultsTable from "./ResultsTable";
import DarkModeToggle from "./DarkModeToggle";
import { useTheme } from "./ThemeProvider";

export default function LeadSourcesPage() {
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState<ImportResult | null>(null);
  const { dark, toggleDark } = useTheme();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Lead Sources
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage and import your lead sources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle dark={dark} onToggle={toggleDark} />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
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
          <ResultsTable
            results={results}
            onImportMore={() => setShowModal(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center text-4xl mb-5">
              📋
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No leads imported yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
              Import your first batch of leads by uploading a CSV file. Our AI
              will automatically map your columns to the CRM fields.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#e94560" }}
            >
              Import Leads via CSV
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <ImportModal
          onClose={() => setShowModal(false)}
          onImportComplete={(data) => {
            setResults(data);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
