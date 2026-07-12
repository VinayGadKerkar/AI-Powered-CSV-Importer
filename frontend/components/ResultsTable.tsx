"use client";

import { CRMRecord, ImportResult } from "./types";

interface Props {
  results: ImportResult;
  onImportMore: () => void;
}

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  GOOD_LEAD_FOLLOW_UP: {
    label: "FOLLOW UP",
    classes:
      "bg-green-100 text-green-700 border border-green-300 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/20",
  },
  BAD_LEAD: {
    label: "BAD LEAD",
    classes:
      "bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20",
  },
  DID_NOT_CONNECT: {
    label: "NO CONNECT",
    classes:
      "bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-500/15 dark:text-gray-400 dark:border-gray-500/20",
  },
  SALE_DONE: {
    label: "SALE DONE",
    classes:
      "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20",
  },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || {
    label: status,
    classes: "bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-700 dark:text-gray-400",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${style.classes}`}>
      {style.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function ImportedTable({ records }: { records: CRMRecord[] }) {
  return (
    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-white/10 max-h-[480px]">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 transition-colors">
          <tr>
            {["LEAD NAME", "EMAIL", "CONTACT", "DATE CREATED", "COMPANY", "STATUS"].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 dark:border-white/10"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent"
            >
              <td className="px-4 py-3 text-gray-900 dark:text-white font-medium whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis">
                {record.name || "—"}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                {record.email || "—"}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {record.country_code && record.mobile_without_country_code
                  ? `${record.country_code} ${record.mobile_without_country_code}`
                  : record.mobile_without_country_code || "—"}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {formatDate(record.created_at)}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis">
                {record.company || "—"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <StatusBadge status={record.crm_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultsTable({ results, onImportMore }: Props) {
  const { imported, skipped, total_imported, total_skipped } = results;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-gray-900 dark:text-white font-semibold text-lg">{total_imported}</span>
            <span className="text-gray-500 text-sm">imported</span>
          </div>
          {total_skipped > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <span className="text-gray-900 dark:text-white font-semibold text-lg">{total_skipped}</span>
              <span className="text-gray-500 text-sm">skipped</span>
            </div>
          )}
        </div>
        <button
          onClick={onImportMore}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#e94560" }}
        >
          + Import More
        </button>
      </div>

      {/* Imported records */}
      {imported.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" />
            Imported Records ({imported.length})
          </h3>
          <ImportedTable records={imported} />
        </div>
      )}

      {/* Skipped records */}
      {skipped.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
            Skipped Records ({skipped.length})
          </h3>
          <div className="overflow-auto rounded-lg border border-gray-200 dark:border-white/10">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {["LEAD NAME", "EMAIL", "SKIP REASON"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 dark:border-white/10"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skipped.map((record, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 bg-white dark:bg-transparent transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {record.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {record.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 whitespace-nowrap">
                        {record._skip_reason || "Unknown reason"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
