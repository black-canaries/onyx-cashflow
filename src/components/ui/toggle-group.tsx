"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  activeColor?: "teal" | "violet" | "rose";
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const colorStyles = {
  teal: "bg-teal-500/20 text-teal-400 shadow-lg shadow-teal-500/10 border-teal-400/30",
  violet:
    "bg-violet-500/20 text-violet-400 shadow-lg shadow-violet-500/10 border-violet-400/30",
  rose: "bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/10 border-rose-400/30",
};

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: ToggleGroupProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-800/60 rounded-xl border border-slate-600/20">
      {options.map((option) => {
        const isActive = value === option.value;
        const activeColor = option.activeColor || "teal";

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border",
              isActive
                ? colorStyles[activeColor]
                : "text-slate-400 hover:text-slate-300 border-transparent"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
