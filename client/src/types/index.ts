// ─────────────────────────────────────────────
// BACKEND TYPES
// ─────────────────────────────────────────────

export type BackendCollection = {
  id: number;
  transaction_id: string;
  transaction_date: string;
  nature_of_collection: string;
  category: string;
  subcategory: string;
  purpose?: string;
  fund_source: string;
  amount: number;
  payor: string;
  or_number: string;
  remarks?: string;
  is_flagged?: boolean;
};

export type BackendDisbursement = {
  id: number;
  transaction_id: string;
  transaction_date: string;
  nature_of_disbursement: string;
  category: string;
  subcategory: string;
  program_description?: string;
  fund_source: string;
  amount: number;
  payee: string;
  or_number: string;
  remarks?: string;
  is_flagged?: boolean;
};

export type BackendBudgetEntry = {
  id: string;
  transaction_id: string;
  transaction_date: string;
  category: string;
  subcategory: string;
  payee: string;
  dv_number: string;
  amount: number;
  fund_source: string;
  expenditure_program: string;
  program_description?: string;
  remarks?: string;
  allocation_id: number;
  created_by: number;
};

// ─────────────────────────────────────────────
// FRONTEND TYPES
// ─────────────────────────────────────────────

export type Collection = {
  id: number;
  transaction_date: string | null;
  category: string;
  nature_of_collection?: string;
  payor: string;
  amount: string;
  fund_source: string;
  created_at?: string;
  is_flagged?: boolean;
  or_number: number;
};

export type Disbursement = {
  transaction_id: string;
  id: number;
  transaction_date: string | null;
  category: string;
  nature_of_disbursement?: string;
  payee: string;
  amount: string;
  fund_source: string;
  created_at?: string;
  is_flagged?: boolean;
  dv_number?: number;
};

export type BudgetEntry = {
  id: string;
  transactionDate: string;
  category: string;
  subcategory: string;
  payee: string;
  dvNumber: string;
  amount: string;
  fundSource: string;
  expenditureProgram: string;
  programDescription?: string;
  remarks?: string;
};

export type DfurProject = {
  id: number;
  transaction_id: string;
  transaction_date: string | null;
  name_of_collection: string;
  project: string;
  location: string;
  total_cost_approved: string;
  total_cost_incurred: string;
  date_started: string | null;
  target_completion_date: string | null;
  status: "planned" | "in_progress" | "completed" | "on_hold" | "cancelled";
  no_extensions: number;
  remarks?: string;
  review_status?: string | undefined;
  review_comment?: string;
  is_flagged?: boolean;
};

export type DfurApiResponse = {
  data: DfurProject[];
  message: string;
};

export type Comment = {
  id: number;
  name: string;
  email: string;
  comment: string;
  created_at?: string;
};