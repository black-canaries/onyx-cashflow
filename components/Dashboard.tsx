"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, Metric, Text } from "@tremor/react";
import { BalanceChart } from "./BalanceChart";
import { TransactionList } from "./TransactionList";
import { TimePeriodSelector } from "./TimePeriodSelector";
import type { TimePeriod, Transaction, Prediction, Category, RecurringRule } from "@/lib/types";
import {
  getTransactions,
  getCategories,
  getPredictions,
  getRecurringRules,
} from "@/lib/storage";
import { generateRecurringPredictions, getDateRangeFromPeriod } from "@/lib/utils";
import { initializeMockData } from "@/lib/mockData";

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1month");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [manualPredictions, setManualPredictions] = useState<Prediction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load data from LocalStorage
  useEffect(() => {
    // Initialize mock data if needed
    initializeMockData();

    // Load data
    setTransactions(getTransactions());
    setManualPredictions(getPredictions());
    setCategories(getCategories());
    setRecurringRules(getRecurringRules());
    setMounted(true);
  }, []);

  // Generate predictions from recurring rules
  const allPredictions = useMemo(() => {
    const { startDate, endDate } = getDateRangeFromPeriod(timePeriod);
    const futureEndDate = new Date();
    futureEndDate.setMonth(futureEndDate.getMonth() + 3); // Look 3 months ahead

    const recurringPredictions = generateRecurringPredictions(
      recurringRules,
      new Date(),
      futureEndDate
    );

    return [...manualPredictions, ...recurringPredictions];
  }, [manualPredictions, recurringRules, timePeriod]);

  // Filter transactions and predictions by time period
  const filteredData = useMemo(() => {
    const { startDate, endDate } = getDateRangeFromPeriod(timePeriod);
    const futureEndDate = new Date();
    futureEndDate.setMonth(futureEndDate.getMonth() + 3);

    const filteredTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    const filteredPredictions = allPredictions.filter((p) => {
      const pDate = new Date(p.date);
      return pDate >= startDate && pDate <= futureEndDate;
    });

    return { filteredTransactions, filteredPredictions };
  }, [transactions, allPredictions, timePeriod]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netChange = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, netChange };
  }, [transactions]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your finances and forecast future balances
          </p>
        </div>
        <TimePeriodSelector selected={timePeriod} onChange={setTimePeriod} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card decoration="top" decorationColor="green">
          <Text>Total Income</Text>
          <Metric className="text-green-600">
            ${summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Metric>
        </Card>
        <Card decoration="top" decorationColor="red">
          <Text>Total Expenses</Text>
          <Metric className="text-red-600">
            ${summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Metric>
        </Card>
        <Card decoration="top" decorationColor={summary.netChange >= 0 ? "green" : "red"}>
          <Text>Net Change</Text>
          <Metric className={summary.netChange >= 0 ? "text-green-600" : "text-red-600"}>
            {summary.netChange >= 0 ? "+" : ""}$
            {summary.netChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Metric>
        </Card>
      </div>

      {/* Chart and Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Balance Trend</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Historical data (solid) and forecasts (dotted)
            </p>
          </div>
          <div className="h-[500px]">
            <BalanceChart
              transactions={filteredData.filteredTransactions}
              predictions={filteredData.filteredPredictions}
              timePeriod={timePeriod}
              initialBalance={3000}
            />
          </div>
        </Card>

        {/* Transaction List - Takes 1 column */}
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transactions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {transactions.length + allPredictions.length} total
            </p>
          </div>
          <TransactionList
            transactions={filteredData.filteredTransactions}
            predictions={filteredData.filteredPredictions}
            categories={categories}
            height="465px"
          />
        </Card>
      </div>
    </div>
  );
}
