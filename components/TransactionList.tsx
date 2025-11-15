"use client";

import { useMemo } from "react";
import { Card, CardBody, Chip, ScrollShadow } from "@heroui/react";
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
    <ScrollShadow className="w-full" style={{ height }}>
      <div className="space-y-4 pr-2">
        {groupedTransactions.map((group) => (
          <div key={group.date}>
            <h3 className="text-sm font-semibold text-default-600 mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
              {formatDate(group.date)}
            </h3>
            <div className="space-y-2">
              {group.items.map((item) => {
                const category = getCategory(item.categoryId);
                const isCredit = item.type === "credit";
                const isForecast = isPrediction(item);

                return (
                  <Card
                    key={item.id}
                    className={`${
                      isForecast ? "border border-dashed border-purple-500/50" : ""
                    }`}
                  >
                    <CardBody className="py-3 px-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">
                              {item.description}
                            </p>
                            {isForecast && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="secondary"
                                className="text-xs"
                              >
                                Forecast
                              </Chip>
                            )}
                            {isForecast && item.isFromRecurring && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="text-xs"
                              >
                                Recurring
                              </Chip>
                            )}
                          </div>
                          {category && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-xs text-default-500">
                                {category.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              isCredit ? "text-success" : "text-danger"
                            }`}
                          >
                            {isCredit ? "+" : ""}
                            {formatCurrency(Math.abs(item.amount))}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollShadow>
  );
}
