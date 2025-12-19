import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;
}

export function Input({
  label,
  prefix,
  className,
  id,
  ...props
}: InputProps) {
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
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={cn(
            "w-full p-3 bg-slate-800/60 border border-slate-500/25 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 transition-all hover:border-slate-400/40",
            prefix && "pl-7",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
