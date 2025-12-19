import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "teal" | "violet";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-teal-500/25 border-teal-400/30",
  secondary:
    "bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border-slate-500/25 hover:border-slate-400/40 shadow-md shadow-black/10",
  ghost:
    "bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-white border-transparent hover:border-slate-600/30",
  teal: "bg-teal-500/20 text-teal-400 border-teal-400/30 shadow-lg shadow-teal-500/10",
  violet:
    "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/25 border-violet-400/30",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-sm",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 border backdrop-blur-sm",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
