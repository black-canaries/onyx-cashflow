"use client";

import { Calendar, Clock } from "lucide-react";
import type { Transaction } from "@/types";

interface TooltipPayload {
  value: number | null;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number;
  transactions: Transaction[];
  monthName: string;
}

export function CustomTooltip({
  active,
  payload,
  label,
  transactions,
  monthName,
}: CustomTooltipProps) {
  if (!active || !payload || label === undefined) return null;

  const dayTx = transactions.filter((t) => t.date === label);
  const actualTx = dayTx.filter((t) => t.status === "actual");
  const forecastTx = dayTx.filter((t) => t.status === "forecast");

  return (
    <div className="backdrop-blur-xl bg-slate-900/90 p-4 rounded-2xl shadow-2xl border border-slate-600/40 min-w-48">
      <p className="font-semibold text-white text-lg mb-2">
        {monthName} {label}
      </p>
      {payload.map(
        (p, i) =>
          p.value !== null && (
            <div key={i} className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-slate-300 text-sm">{p.name}:</span>
              <span className="text-white font-medium">
                £{p.value.toLocaleString()}
              </span>
            </div>
          )
      )}
      {actualTx.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-600/40">
          <p className="text-xs font-medium text-teal-400 mb-2 flex items-center gap-1.5">
            <Calendar size={11} />
            Actual
          </p>
          {actualTx.map((t) => (
            <div key={t.id} className="flex justify-between text-sm mb-1">
              <span className="text-slate-400 truncate max-w-24">
                {t.description}
              </span>
              <span
                className={
                  t.type === "income" ? "text-teal-400" : "text-rose-400"
                }
              >
                {t.type === "income" ? "+" : "-"}£{t.amount}
              </span>
            </div>
          ))}
        </div>
      )}
      {forecastTx.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-600/40">
          <p className="text-xs font-medium text-violet-400 mb-2 flex items-center gap-1.5">
            <Clock size={11} />
            Forecast
          </p>
          {forecastTx.map((t) => (
            <div key={t.id} className="flex justify-between text-sm mb-1">
              <span className="text-slate-500 truncate max-w-24">
                {t.description}
              </span>
              <span
                className={
                  t.type === "income"
                    ? "text-teal-400/60"
                    : "text-rose-400/60"
                }
              >
                {t.type === "income" ? "+" : "-"}£{t.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
