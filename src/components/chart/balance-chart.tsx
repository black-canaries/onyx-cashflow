"use client";

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
import { Card } from "@/components/ui/card";
import { CustomTooltip } from "./custom-tooltip";
import { CustomDot } from "./custom-dot";
import { formatCurrencyCompact } from "@/lib/utils";
import type { ChartDataPoint, Transaction } from "@/types";

interface BalanceChartProps {
  chartData: ChartDataPoint[];
  transactions: Transaction[];
  today: number;
  monthName: string;
  selectedDay: number | null;
  onDaySelect: (day: number | null) => void;
  editingId: number | null;
}

export function BalanceChart({
  chartData,
  transactions,
  today,
  monthName,
  selectedDay,
  onDaySelect,
  editingId,
}: BalanceChartProps) {
  const handleChartClick = (data: { activePayload?: Array<{ payload: ChartDataPoint }> } | null) => {
    if (editingId) return;
    if (data?.activePayload?.[0]?.payload) {
      const clickedDay = data.activePayload[0].payload.day;
      if (transactions.some((t) => t.date === clickedDay)) {
        onDaySelect(selectedDay === clickedDay ? null : clickedDay);
      }
    }
  };

  return (
    <Card className="p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Balance Overview
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Click points to view transactions
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-400 shadow-md shadow-teal-400/30" />
            <span className="text-slate-400">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-violet-400 border-dashed" />
            <span className="text-slate-400">With Forecast</span>
          </div>
        </div>
      </div>
      <div className="h-56 sm:h-72 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onClick={handleChartClick}
          >
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="#475569"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#475569"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrencyCompact}
              width={50}
            />
            <Tooltip
              content={
                <CustomTooltip
                  transactions={transactions}
                  monthName={monthName}
                />
              }
              cursor={{ stroke: "#475569", strokeDasharray: "4 4" }}
            />
            {selectedDay !== null && (
              <ReferenceLine
                x={selectedDay}
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}
            <ReferenceLine
              x={today}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{
                value: "Today",
                position: "top",
                fill: "#64748b",
                fontSize: 11,
              }}
            />
            <ReferenceLine
              y={0}
              stroke="#ef4444"
              strokeOpacity={0.3}
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#14b8a6"
              strokeWidth={2.5}
              fill="url(#actualGrad)"
              dot={<CustomDot dataKey="actual" selectedDay={selectedDay} />}
              activeDot={{
                fill: "#14b8a6",
                r: 6,
                stroke: "#0d9488",
                strokeWidth: 2,
              }}
              name="Actual"
              connectNulls={true}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="url(#forecastGrad)"
              dot={<CustomDot dataKey="forecast" selectedDay={selectedDay} />}
              activeDot={{
                fill: "#a78bfa",
                r: 6,
                stroke: "#8b5cf6",
                strokeWidth: 2,
              }}
              name="With Forecast"
              connectNulls={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
