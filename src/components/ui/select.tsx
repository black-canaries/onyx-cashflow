import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string | number; label: string }>;
}

export function Select({
  label,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs text-slate-500 mb-1.5 ml-1"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "w-full p-3 bg-slate-800/60 border border-slate-500/25 rounded-xl text-white text-sm focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 transition-all hover:border-slate-400/40",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
