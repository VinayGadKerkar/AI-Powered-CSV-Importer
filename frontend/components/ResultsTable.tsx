"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CRMRecord, ImportResult } from "./types";

interface Props {
  results: ImportResult;
  onImportMore: () => void;
}

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  GOOD_LEAD_FOLLOW_UP: {
    label: "FOLLOW UP",
    classes: "bg-green-500/15 text-green-400 border border-green-500/20",
  },
  BAD_LEAD: {
    label: "BAD LEAD",
    classes: "bg-red-500/15 text-red-400 border border-red-500/20",
  },
  DID_NOT_CONNECT: {
    label: "NO CONNECT",
    classes: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
  },
  SALE_DONE: {
    label: "SALE DONE",
    classes: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || {
    label: status,
    classes: "bg-gray-700 text-gray-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.classes}`}>
      {style.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function VirtualizedTable({ records }: { records: CRMRecord[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="overflow-auto max-h-96 border border-white/10 rounded-lg"
    >
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-gray-800">
          <tr>
            {["LEAD NAME", "EMAIL", "CONTACT", "DATE CREATED", "COMPANY", "STATUS"].map(
              (col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap border-b border-white/10"
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {items.map((virtualRow) => {
            const record = records[virtualRow.index];
            return (
              <tr
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="absolute w-full border-b border-white/5 hover:bg-white/5 transition-colors"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <td className="px-4 py-3 text-white font-medium whitespace-nowrap max-w-[160px] truncate">
                  {record.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap max-w-[180px] truncate">
                  {record.email || "—"}
                </td>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                  {record.country_code && record.mobile_without_country_code
                    ? `${record.country_code} ${record.mobile_without_country_code}`
                    : record.mobile_without_country_code || "—"}
                </td>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                  {formatDate(record.created_at)}
                </td>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap max-w-[140px] truncate">
                  {record.company || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={record.crm_status} />
                </td>
              </tr>
            );
          })}
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
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-white font-semibold text-lg">
              {total_imported}
            </span>
            <span className="text-gray-400 text-sm">imported</span>
          </div>
          {total_skipped > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-white font-semibold text-lg">
                {total_skipped}
              </span>
              <span className="text-gray-400 text-sm">skipped</span>
            </div>
          )}
        </div>
        <button
          onClick={onImportMore}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: "#e94560" }}
        >
          + Import More
        </button>
      </div>

      {/* Imported records */}
      {imported.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Imported Records ({imported.length})
          </h3>
          <VirtualizedTable records={imported} />
        </div>
      )}

      {/* Skipped records */}
      {skipped.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Skipped Records ({skipped.length})
          </h3>
          <div className="overflow-auto rounded-lg border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  {["LEAD NAME", "EMAIL", "SKIP REASON"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap border-b border-white/10"
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
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {record.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {record.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">
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
