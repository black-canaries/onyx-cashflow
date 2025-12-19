"use client";

import { StatCard } from "./stat-card";
import type { BudgetStats } from "@/types";

interface StatsGridProps {
  stats: BudgetStats;
  startingBalance: number;
  onStartingBalanceChange: (value: number) => void;
}

export function StatsGrid({
  stats,
  startingBalance,
  onStartingBalanceChange,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <StatCard
        title="Starting Balance"
        value={`£${startingBalance}`}
        variant="default"
        icon="wallet"
        editable
        onValueChange={onStartingBalanceChange}
      />
      <StatCard
        title="Income"
        value={`£${stats.actualIncome}`}
        variant="teal"
        icon="income"
        forecast={stats.forecastIncome > 0 ? stats.forecastIncome.toLocaleString() : undefined}
      />
      <StatCard
        title="Expenses"
        value={`£${stats.actualExpenses}`}
        variant="rose"
        icon="expense"
        forecast={stats.forecastExpenses > 0 ? stats.forecastExpenses.toLocaleString() : undefined}
      />
      <StatCard
        title="Projected"
        value={`£${stats.projectedEnd}`}
        variant="violet"
        icon="projected"
        subtitle={`Current: £${stats.currentBalance.toLocaleString()}`}
      />
    </div>
  );
}
