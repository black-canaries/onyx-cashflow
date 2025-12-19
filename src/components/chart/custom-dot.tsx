"use client";

import type { ChartDataPoint } from "@/types";

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
  dataKey: "actual" | "forecast";
  selectedDay: number | null;
}

export function CustomDot({
  cx,
  cy,
  payload,
  dataKey,
  selectedDay,
}: CustomDotProps) {
  if (!payload || cx === undefined || cy === undefined) return null;

  const isActual = dataKey === "actual";
  const hasTransactions = isActual
    ? payload.hasActualTransactions
    : payload.hasForecastTransactions;

  if (!hasTransactions) return null;

  const isSelected = selectedDay === payload.day;
  const count = isActual ? payload.actualCount : payload.forecastCount;

  return (
    <g style={{ cursor: "pointer" }}>
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={16}
          fill={isActual ? "#14b8a6" : "#a78bfa"}
          opacity={0.2}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 10 : 7}
        fill={isSelected ? "#fbbf24" : isActual ? "#14b8a6" : "#a78bfa"}
        stroke={isSelected ? "#f59e0b" : isActual ? "#0d9488" : "#8b5cf6"}
        strokeWidth={2.5}
        strokeDasharray={isActual ? "0" : "4 2"}
      />
      {count > 1 && (
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={9}
          fontWeight="600"
        >
          {count}
        </text>
      )}
    </g>
  );
}
