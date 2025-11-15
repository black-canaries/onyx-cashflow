"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type {
  Transaction,
  Prediction,
  TimePeriod,
  ChartDataPoint,
} from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface BalanceChartProps {
  transactions: Transaction[];
  predictions: Prediction[];
  timePeriod: TimePeriod;
  initialBalance?: number;
}

export function BalanceChart({
  transactions,
  predictions,
  timePeriod,
  initialBalance = 3000,
}: BalanceChartProps) {
  const chartData = useMemo(() => {
    // Combine and sort all transactions and predictions
    const allItems = [
      ...transactions.map((t) => ({
        date: new Date(t.date),
        amount: t.amount,
        isHistorical: true,
      })),
      ...predictions.map((p) => ({
        date: new Date(p.date),
        amount: p.amount,
        isHistorical: false,
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance
    let balance = initialBalance;
    const dataPoints: ChartDataPoint[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group by date and calculate daily balances
    const dailyData = new Map<string, { balance: number; isHistorical: boolean }>();

    allItems.forEach((item) => {
      const dateKey = item.date.toISOString().split("T")[0];
      balance += item.amount;

      dailyData.set(dateKey, {
        balance,
        isHistorical: item.date <= today,
      });
    });

    // Convert to array and sort
    dailyData.forEach((value, dateKey) => {
      dataPoints.push({
        date: dateKey,
        balance: value.balance,
        netChange: 0, // Will be calculated if needed
        isHistorical: value.isHistorical,
      });
    });

    // Add today's balance if not present
    const todayKey = today.toISOString().split("T")[0];
    if (!dailyData.has(todayKey) && dataPoints.length > 0) {
      const lastHistoricalBalance =
        dataPoints[dataPoints.length - 1]?.balance || initialBalance;
      dataPoints.push({
        date: todayKey,
        balance: lastHistoricalBalance,
        netChange: 0,
        isHistorical: true,
      });
    }

    return dataPoints.sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, predictions, initialBalance]);

  // Split data into historical and forecast
  const historicalData = chartData.filter((d) => d.isHistorical);
  const forecastData = chartData.filter((d) => !d.isHistorical);

  // Create combined data for smooth transition
  const combinedData = useMemo(() => {
    if (historicalData.length === 0) return forecastData;
    if (forecastData.length === 0) return historicalData;

    const lastHistorical = historicalData[historicalData.length - 1];
    return [...historicalData, ...forecastData];
  }, [historicalData, forecastData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-content1 border border-divider rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-1">
            {formatDateShort(data.date)}
          </p>
          <p className="text-sm">
            Balance: <span className="font-bold">{formatCurrency(data.balance)}</span>
          </p>
          <p className="text-xs text-default-500 mt-1">
            {data.isHistorical ? "Historical" : "Forecast"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={combinedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0070f3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0070f3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-divider" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatDateShort(date)}
            className="text-xs text-default-500"
            stroke="currentColor"
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            className="text-xs text-default-500"
            stroke="currentColor"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={new Date().toISOString().split("T")[0]}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: "Today", position: "top", fill: "#ef4444" }}
          />

          {/* Historical data - solid line */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#0070f3"
            strokeWidth={2}
            fill="url(#colorBalance)"
            data={historicalData}
            connectNulls
          />

          {/* Forecast data - dotted line */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorForecast)"
            data={forecastData}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
