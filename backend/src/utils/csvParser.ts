import { parse } from "csv-parse";

export type CSVRow = Record<string, string>;

/**
 * Parses a CSV string into an array of objects with dynamic headers.
 * Headers are read from the first row — no fixed column assumptions.
 */
export function parseCSV(csvContent: string): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    parse(
      csvContent,
      {
        columns: true,          // Use first row as headers
        skip_empty_lines: true,
        trim: true,
        bom: true,              // Handle BOM character
        relax_quotes: true,
        relax_column_count: true,
      },
      (err, records: CSVRow[]) => {
        if (err) {
          reject(new Error(`CSV parse error: ${err.message}`));
        } else {
          resolve(records);
        }
      }
    );
  });
}
