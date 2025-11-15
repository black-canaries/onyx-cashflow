"use client";

import { useMemo } from "react";
import { Badge } from "@tremor/react";
import type { Transaction, Prediction, Category } from "@/lib/types";
import { formatCurrency, formatDate, getCategoryById } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  predictions: Prediction[];
  categories: Category[];
  height?: string;
}

interface GroupedTransaction {
  date: string;
  items: (Transaction | Prediction)[];
}

export function TransactionList({
  transactions,
  predictions,
  categories,
  height = "600px",
}: TransactionListProps) {
  const groupedTransactions = useMemo(() => {
    // Combine transactions and predictions
    const allItems = [...transactions, ...predictions];

    // Sort by date (newest first)
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Group by date
    const grouped = new Map<string, (Transaction | Prediction)[]>();

    allItems.forEach((item) => {
      const dateKey = new Date(item.date).toISOString().split("T")[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(item);
    });

    // Convert to array
    const result: GroupedTransaction[] = [];
    grouped.forEach((items, date) => {
      result.push({ date, items });
    });

    return result;
  }, [transactions, predictions]);

  const isPrediction = (item: Transaction | Prediction): item is Prediction => {
    return "isFromRecurring" in item;
  };

  const getCategory = (categoryId: string | null): Category | null => {
    return getCategoryById(categories, categoryId);
  };

  return (
    <div className="w-full overflow-y-auto" style={{ height }}>
      <div className="space-y-4 pr-2">
        {groupedTransactions.map((group) => (
          <div key={group.date}>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm py-1 z-10">
              {formatDate(group.date)}
            </h3>
            <div className="space-y-2">
              {group.items.map((item) => {
                const category = getCategory(item.categoryId);
                const isCredit = item.type === "credit";
                const isForecast = isPrediction(item);

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-gray-900 rounded-lg border p-3 shadow-sm ${
                      isForecast
                        ? "border-dashed border-purple-500/50"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                            {item.description}
                          </p>
                          {isForecast && (
                            <Badge size="xs" color="purple">
                              Forecast
                            </Badge>
                          )}
                          {isForecast && item.isFromRecurring && (
                            <Badge size="xs" color="blue">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        {category && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {category.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            isCredit ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isCredit ? "+" : ""}
                          {formatCurrency(Math.abs(item.amount))}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
