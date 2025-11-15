import type {
  Transaction,
  Prediction,
  RecurringRule,
  RecurrenceFrequency,
  TimePeriod,
  BalanceDataPoint,
  Category,
} from "./types";

// Date utilities
export const getDateRangeFromPeriod = (
  period: TimePeriod,
  baseDate: Date = new Date()
): { startDate: Date; endDate: Date } => {
  const endDate = new Date(baseDate);
  const startDate = new Date(baseDate);

  switch (period) {
    case "1week":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "1month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "3months":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "6months":
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "9months":
      startDate.setMonth(startDate.getMonth() - 9);
      break;
    case "1year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
};

export const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonthsToDate = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
};

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
};

export const isDateInRange = (
  date: string | Date,
  startDate: Date,
  endDate: Date
): boolean => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d >= startDate && d <= endDate;
};

// Recurring transaction generation
export const getNextOccurrence = (
  date: Date,
  frequency: RecurrenceFrequency
): Date => {
  const next = new Date(date);

  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

export const generateRecurringPredictions = (
  rules: RecurringRule[],
  startDate: Date,
  endDate: Date
): Prediction[] => {
  const predictions: Prediction[] = [];
  const now = new Date().toISOString();

  rules.forEach((rule) => {
    let currentDate = new Date(rule.startDate);
    const ruleEndDate = rule.endDate ? new Date(rule.endDate) : endDate;

    while (currentDate <= endDate && currentDate <= ruleEndDate) {
      if (currentDate >= startDate && currentDate > new Date()) {
        predictions.push({
          id: crypto.randomUUID(),
          date: currentDate.toISOString(),
          description: rule.description,
          amount: rule.amount,
          type: rule.type,
          categoryId: rule.categoryId,
          isFromRecurring: true,
          recurringRuleId: rule.id,
          createdAt: now,
          updatedAt: now,
        });
      }
      currentDate = getNextOccurrence(currentDate, rule.frequency);
    }
  });

  return predictions;
};

// Balance calculations
export const calculateRunningBalance = (
  transactions: Transaction[],
  predictions: Prediction[],
  initialBalance: number = 0,
  startDate?: Date,
  endDate?: Date
): BalanceDataPoint[] => {
  // Combine transactions and predictions
  const allItems = [
    ...transactions.map((t) => ({ ...t, isHistorical: true })),
    ...predictions.map((p) => ({ ...p, isHistorical: false })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter by date range if provided
  const filteredItems = allItems.filter((item) => {
    const itemDate = new Date(item.date);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });

  // Group by date
  const groupedByDate = new Map<string, (Transaction | Prediction)[]>();
  filteredItems.forEach((item) => {
    const dateKey = new Date(item.date).toISOString().split("T")[0];
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(item);
  });

  // Calculate running balance
  const dataPoints: BalanceDataPoint[] = [];
  let runningBalance = initialBalance;

  const sortedDates = Array.from(groupedByDate.keys()).sort();

  sortedDates.forEach((dateKey) => {
    const items = groupedByDate.get(dateKey)!;
    const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);
    runningBalance += dayTotal;

    const isHistorical = items.every((item) => "updatedAt" in item);

    dataPoints.push({
      date: dateKey,
      balance: runningBalance,
      netChange: dayTotal,
      isHistorical,
      transactions: items,
    });
  });

  return dataPoints;
};

// Filter transactions by date range
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter((t) => isDateInRange(t.date, startDate, endDate));
};

// Get category by ID
export const getCategoryById = (
  categories: Category[],
  id: string | null
): Category | null => {
  if (!id) return null;
  return categories.find((c) => c.id === id) || null;
};

// Get transactions by category
export const getTransactionsByCategory = (
  transactions: Transaction[],
  categoryId: string
): Transaction[] => {
  return transactions.filter((t) => t.categoryId === categoryId);
};

// Calculate category totals
export const calculateCategoryTotals = (
  transactions: Transaction[],
  categories: Category[]
): Map<string, { category: Category; total: number; count: number }> => {
  const totals = new Map<string, { category: Category; total: number; count: number }>();

  categories.forEach((category) => {
    totals.set(category.id, { category, total: 0, count: 0 });
  });

  transactions.forEach((transaction) => {
    if (transaction.categoryId && totals.has(transaction.categoryId)) {
      const entry = totals.get(transaction.categoryId)!;
      entry.total += transaction.amount;
      entry.count += 1;
    }
  });

  return totals;
};

// Get transactions for a specific date
export const getTransactionsForDate = (
  transactions: Transaction[],
  predictions: Prediction[],
  date: string
): (Transaction | Prediction)[] => {
  const targetDate = new Date(date).toISOString().split("T")[0];
  const allItems = [...transactions, ...predictions];

  return allItems.filter((item) => {
    const itemDate = new Date(item.date).toISOString().split("T")[0];
    return itemDate === targetDate;
  });
};

// Sort transactions by date (newest first)
export const sortTransactionsByDate = (
  transactions: (Transaction | Prediction)[],
  order: "asc" | "desc" = "desc"
): (Transaction | Prediction)[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
};

// Class name utility (similar to clsx)
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};
