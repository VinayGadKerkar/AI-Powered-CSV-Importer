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

export interface ImportResult {
  imported: CRMRecord[];
  skipped: CRMRecord[];
  total_imported: number;
  total_skipped: number;
}

export type ModalStep = "upload" | "preview" | "loading" | "results";
