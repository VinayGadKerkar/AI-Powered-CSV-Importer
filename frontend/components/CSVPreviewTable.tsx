"use client";

interface Props {
  headers: string[];
  rows: Record<string, string>[];
}

export default function CSVPreviewTable({ headers, rows }: Props) {
  if (!headers.length) return null;

  return (
    <div className="relative overflow-auto max-h-72 rounded-lg border border-white/10">
      <table className="min-w-full text-xs">
        <thead className="sticky top-0 z-10 bg-gray-800">
          <tr>
            <th className="px-3 py-2.5 text-left text-gray-400 font-medium w-10 border-b border-white/10">
              #
            </th>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-left text-gray-400 font-medium whitespace-nowrap border-b border-white/10"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
              {headers.map((h) => (
                <td
                  key={h}
                  className="px-3 py-2 text-gray-300 whitespace-nowrap max-w-xs truncate"
                  title={row[h] || ""}
                >
                  {row[h] || (
                    <span className="text-gray-600 italic">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
