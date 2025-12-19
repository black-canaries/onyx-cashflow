export type TransactionStatus = "actual" | "forecast";
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  date: number;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
}

export interface NewTransaction {
  date: number;
  type: TransactionType;
  amount: string;
  description: string;
  status: TransactionStatus;
}

export interface EditTransaction {
  date: number;
  type: TransactionType;
  amount: string;
  description: string;
  status: TransactionStatus;
}

export interface ChartDataPoint {
  day: number;
  actual: number;
  forecast: number | null;
  hasActualTransactions: boolean;
  hasForecastTransactions: boolean;
  actualCount: number;
  forecastCount: number;
}

export interface BudgetStats {
  actualIncome: number;
  actualExpenses: number;
  forecastIncome: number;
  forecastExpenses: number;
  currentBalance: number;
  projectedEnd: number;
}

export interface ColumnMapping {
  date: string;
  amount: string;
  description: string;
  type: string;
}

export interface MappedTransaction extends Transaction {
  selected: boolean;
}
