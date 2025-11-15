// Core data types for the personal finance dashboard

export type TransactionType = "debit" | "credit";

export type RecurrenceFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export type TimePeriod =
  | "1week"
  | "1month"
  | "3months"
  | "6months"
  | "9months"
  | "1year";

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number; // Positive for credits, negative for debits
  type: TransactionType;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringRule {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string | null;
  frequency: RecurrenceFrequency;
  startDate: string; // ISO date string
  endDate: string | null; // null for unbounded
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string | null;
  isFromRecurring: boolean; // true if auto-generated from recurring rule
  recurringRuleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceDataPoint {
  date: string;
  balance: number;
  netChange: number;
  isHistorical: boolean; // true for actual data, false for forecast
  transactions: (Transaction | Prediction)[];
}

export interface ChartDataPoint {
  date: string;
  balance: number;
  netChange: number;
  isHistorical: boolean;
}

// CSV Import types
export interface CSVFieldMapping {
  date: string;
  description: string;
  amount: string;
  type?: string;
  category?: string;
}

export interface CSVImportData {
  headers: string[];
  rows: string[][];
  mapping: Partial<CSVFieldMapping>;
}

// LocalStorage schema
export interface LocalStorageData {
  transactions: Transaction[];
  categories: Category[];
  recurringRules: RecurringRule[];
  predictions: Prediction[];
  settings: {
    theme: "light" | "dark";
    defaultTimePeriod: TimePeriod;
  };
}
