"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardBody, Divider } from "@heroui/react";
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
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-default-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-500 mt-1">
            Track your finances and forecast future balances
          </p>
        </div>
        <TimePeriodSelector selected={timePeriod} onChange={setTimePeriod} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="py-4">
            <p className="text-sm text-default-500">Total Income</p>
            <p className="text-2xl font-bold text-success">
              ${summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-sm text-default-500">Total Expenses</p>
            <p className="text-2xl font-bold text-danger">
              ${summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-sm text-default-500">Net Change</p>
            <p
              className={`text-2xl font-bold ${
                summary.netChange >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {summary.netChange >= 0 ? "+" : ""}$
              {summary.netChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Chart and Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Balance Trend</h2>
              <p className="text-sm text-default-500">
                Historical data (solid) and forecasts (dotted)
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="h-[500px]">
              <BalanceChart
                transactions={filteredData.filteredTransactions}
                predictions={filteredData.filteredPredictions}
                timePeriod={timePeriod}
                initialBalance={3000}
              />
            </div>
          </CardBody>
        </Card>

        {/* Transaction List - Takes 1 column */}
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-xl font-semibold">Transactions</h2>
              <p className="text-sm text-default-500">
                {transactions.length + allPredictions.length} total
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            <div className="p-4">
              <TransactionList
                transactions={filteredData.filteredTransactions}
                predictions={filteredData.filteredPredictions}
                categories={categories}
                height="465px"
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
