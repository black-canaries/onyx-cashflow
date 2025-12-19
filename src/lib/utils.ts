import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  Transaction,
  ChartDataPoint,
  BudgetStats,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return `£${value.toLocaleString()}`;
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(0)}k`;
  }
  return `£${value}`;
}

export function calculateChartData(
  transactions: Transaction[],
  startingBalance: number,
  daysInMonth: number,
  today: number
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let runningActualBalance = startingBalance;
  let runningForecastBalance = startingBalance;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayTransactions = transactions.filter((t) => t.date === day);
    const actualTransactions = dayTransactions.filter(
      (t) => t.status === "actual"
    );
    const forecastTransactions = dayTransactions.filter(
      (t) => t.status === "forecast"
    );

    const actualIncome = actualTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const actualExpense = actualTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const forecastIncome = forecastTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const forecastExpense = forecastTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    runningActualBalance += actualIncome - actualExpense;
    runningForecastBalance +=
      actualIncome + forecastIncome - (actualExpense + forecastExpense);

    data.push({
      day,
      actual: runningActualBalance,
      forecast:
        forecastTransactions.length > 0 || day > today
          ? runningForecastBalance
          : null,
      hasActualTransactions: actualTransactions.length > 0,
      hasForecastTransactions: forecastTransactions.length > 0,
      actualCount: actualTransactions.length,
      forecastCount: forecastTransactions.length,
    });
  }
  return data;
}

export function calculateStats(
  transactions: Transaction[],
  startingBalance: number
): BudgetStats {
  const actualTransactions = transactions.filter((t) => t.status === "actual");
  const forecastTransactions = transactions.filter(
    (t) => t.status === "forecast"
  );
  const actualIncome = actualTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const actualExpenses = actualTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const forecastIncome = forecastTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const forecastExpenses = forecastTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = startingBalance + actualIncome - actualExpenses;
  const projectedEnd = currentBalance + forecastIncome - forecastExpenses;

  return {
    actualIncome,
    actualExpenses,
    forecastIncome,
    forecastExpenses,
    currentBalance,
    projectedEnd,
  };
}
