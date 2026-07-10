import { Mistral } from "@mistralai/mistralai";
import { CSVRow } from "../utils/csvParser";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || "" });

// ── Types ────────────────────────────────────────────────────────────────────

export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE";
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
  _skipped: boolean;
  _skip_reason: string;
}

export interface ExtractionResult {
  imported: CRMRecord[];
  skipped: CRMRecord[];
  total_imported: number;
  total_skipped: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BATCH_SIZE = 20;
const MAX_RETRIES = 3;

const VALID_CRM_STATUSES = new Set([
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
]);

const VALID_DATA_SOURCES = new Set([
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
]);

// ── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a CRM data extraction assistant. You will receive rows from a CSV file with unknown column names. Your job is to intelligently map each row to the GrowEasy CRM format.

CRM Fields to extract:
- created_at: Lead creation date (must be parseable by new Date())
- name: Lead's full name
- email: Primary email address
- country_code: Country dial code (e.g. +91)
- mobile_without_country_code: Mobile number without country code
- company: Company or organization name
- city, state, country: Location fields
- lead_owner: Email or name of the person who owns this lead
- crm_status: MUST be one of: GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE
- crm_note: Remarks, follow-up notes, extra emails, extra phone numbers, anything that doesn't fit another field
- data_source: One of: leads_on_demand | meridian_tower | eden_park | varah_swamy | sarjapur_plots — leave blank if none match
- possession_time: Property possession time if mentioned
- description: Additional description

Rules:
1. crm_status must ONLY be one of the 4 allowed values. Infer from context if needed.
2. data_source must ONLY be one of the 5 allowed values or left blank.
3. If a record has neither email nor mobile, mark it as skipped with reason "missing_contact".
4. If multiple emails exist, use the first as email and append the rest to crm_note.
5. If multiple mobiles exist, use the first and append the rest to crm_note.
6. created_at must be a valid date string parseable by JavaScript's new Date().
7. Do not add line breaks inside field values — escape as \\n if needed.
8. Return ONLY a valid JSON object with a single key "records" containing an array. No explanation, no markdown, no code fences.

Return format:
{"records": [{"created_at": "...","name": "...","email": "...","country_code": "...","mobile_without_country_code": "...","company": "...","city": "...","state": "...","country": "...","lead_owner": "...","crm_status": "...","crm_note": "...","data_source": "...","possession_time": "...","description": "...","_skipped": false,"_skip_reason": ""}]}

For skipped records, set "_skipped": true and "_skip_reason" to the reason.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Splits an array into chunks of a given size.
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Validates and normalises a single CRM record coming back from the AI.
 */
function normaliseRecord(raw: Partial<CRMRecord>): CRMRecord {
  const record: CRMRecord = {
    created_at: raw.created_at || "",
    name: raw.name || "",
    email: raw.email || "",
    country_code: raw.country_code || "",
    mobile_without_country_code: raw.mobile_without_country_code || "",
    company: raw.company || "",
    city: raw.city || "",
    state: raw.state || "",
    country: raw.country || "",
    lead_owner: raw.lead_owner || "",
    crm_status: VALID_CRM_STATUSES.has(raw.crm_status || "")
      ? (raw.crm_status as CRMRecord["crm_status"])
      : "DID_NOT_CONNECT",
    crm_note: raw.crm_note || "",
    data_source: VALID_DATA_SOURCES.has(raw.data_source || "")
      ? raw.data_source || ""
      : "",
    possession_time: raw.possession_time || "",
    description: raw.description || "",
    _skipped: raw._skipped === true,
    _skip_reason: raw._skip_reason || "",
  };
  return record;
}

/**
 * Calls Mistral AI for a single batch with retry + exponential backoff.
 */
async function processBatchWithRetry(
  batch: CSVRow[],
  batchIndex: number,
  totalBatches: number
): Promise<CRMRecord[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `  Batch ${batchIndex + 1}/${totalBatches} — attempt ${attempt}/${MAX_RETRIES}`
      );

      const response = await client.chat.complete({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(batch) },
        ],
        temperature: 0.1,
        responseFormat: { type: "json_object" },
      });

      const text = response.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        throw new Error("Empty response from Mistral AI");
      }

      const parsed = JSON.parse(text) as { records: Partial<CRMRecord>[] };

      if (!Array.isArray(parsed.records)) {
        throw new Error(
          `AI response missing 'records' array. Got: ${JSON.stringify(parsed).slice(0, 200)}`
        );
      }

      return parsed.records.map(normaliseRecord);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `  Batch ${batchIndex + 1} attempt ${attempt} failed: ${lastError.message}`
      );

      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`  Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  // All retries exhausted — mark the whole batch as skipped
  console.error(
    `  Batch ${batchIndex + 1} failed after ${MAX_RETRIES} attempts. Marking as skipped.`
  );
  return batch.map(() =>
    normaliseRecord({
      _skipped: true,
      _skip_reason: "ai_batch_failed",
    })
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Extracts CRM records from raw CSV rows using Mistral AI.
 * Splits into batches of 20, processes each with retry logic.
 */
export async function extractCRMRecords(
  rows: CSVRow[],
  onProgress?: (current: number, total: number) => void
): Promise<ExtractionResult> {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error(
      "MISTRAL_API_KEY is not set. Please configure it in your .env file."
    );
  }

  const batches = chunkArray(rows, BATCH_SIZE);
  const allRecords: CRMRecord[] = [];

  console.log(
    `🤖 Starting AI extraction: ${rows.length} rows → ${batches.length} batch(es)`
  );

  for (let i = 0; i < batches.length; i++) {
    onProgress?.(i + 1, batches.length);
    const batchRecords = await processBatchWithRetry(batches[i], i, batches.length);
    allRecords.push(...batchRecords);
  }

  const imported = allRecords.filter((r) => !r._skipped);
  const skipped = allRecords.filter((r) => r._skipped);

  console.log(
    `✅ Extraction complete: ${imported.length} imported, ${skipped.length} skipped`
  );

  return {
    imported,
    skipped,
    total_imported: imported.length,
    total_skipped: skipped.length,
  };
}
