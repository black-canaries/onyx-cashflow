"use client";

import { Card } from "@/components/ui/card";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  forecast?: string;
  variant: "default" | "teal" | "rose" | "violet";
  icon: "wallet" | "income" | "expense" | "projected";
  editable?: boolean;
  onValueChange?: (value: number) => void;
}

const iconMap: Record<StatCardProps["icon"], ReactNode> = {
  wallet: <Wallet size={14} />,
  income: <ArrowUpRight size={14} />,
  expense: <ArrowDownRight size={14} />,
  projected: <TrendingUp size={14} />,
};

const iconColorMap: Record<StatCardProps["variant"], string> = {
  default: "text-slate-500",
  teal: "text-teal-400/80",
  rose: "text-rose-400/80",
  violet: "text-violet-400/80",
};

const valueColorMap: Record<StatCardProps["variant"], string> = {
  default: "text-white",
  teal: "text-teal-400",
  rose: "text-rose-400",
  violet: "text-violet-400",
};

const forecastColorMap: Record<StatCardProps["variant"], string> = {
  default: "text-slate-500/60",
  teal: "text-teal-500/60",
  rose: "text-rose-500/60",
  violet: "text-violet-500/60",
};

export function StatCard({
  title,
  value,
  subtitle,
  forecast,
  variant,
  icon,
  editable,
  onValueChange,
}: StatCardProps) {
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ""));

  return (
    <Card variant={variant} hoverable className="p-4 sm:p-5">
      <div className={`flex items-center gap-2 text-xs sm:text-sm mb-3 ${iconColorMap[variant]}`}>
        {iconMap[icon]}
        <span>{title}</span>
      </div>
      <div className="flex items-baseline">
        <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${valueColorMap[variant]}`}>
          £
        </span>
        {editable ? (
          <input
            type="number"
            value={numericValue}
            onChange={(e) => onValueChange?.(parseFloat(e.target.value) || 0)}
            className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-transparent outline-none w-full ${valueColorMap[variant]}`}
          />
        ) : (
          <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${valueColorMap[variant]}`}>
            {numericValue.toLocaleString()}
          </span>
        )}
      </div>
      {forecast && (
        <p className={`text-xs mt-1.5 flex items-center gap-1 ${forecastColorMap[variant]}`}>
          <Sparkles size={10} />
          +£{forecast} forecast
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>
      )}
    </Card>
  );
}
