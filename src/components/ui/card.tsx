import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "teal" | "rose" | "violet";
  hoverable?: boolean;
}

const variantStyles = {
  default:
    "bg-gradient-to-br from-slate-800/40 to-slate-900/50 border-slate-500/20",
  teal:
    "bg-gradient-to-br from-teal-950/40 to-slate-900/50 border-teal-400/20 shadow-teal-900/20",
  rose:
    "bg-gradient-to-br from-rose-950/40 to-slate-900/50 border-rose-400/20 shadow-rose-900/20",
  violet:
    "bg-gradient-to-br from-violet-950/40 to-slate-900/50 border-violet-400/20 shadow-violet-900/20",
};

const hoverVariantStyles = {
  default: "hover:border-slate-400/30 hover:shadow-xl hover:shadow-black/20",
  teal: "hover:border-teal-400/35 hover:shadow-xl hover:shadow-teal-900/30",
  rose: "hover:border-rose-400/35 hover:shadow-xl hover:shadow-rose-900/30",
  violet:
    "hover:border-violet-400/35 hover:shadow-xl hover:shadow-violet-900/30",
};

const glowVariantStyles = {
  default: "from-slate-400/5",
  teal: "from-teal-500/5",
  rose: "from-rose-500/5",
  violet: "from-violet-500/5",
};

const topLineVariantStyles = {
  default: "via-slate-400/30",
  teal: "via-teal-400/40",
  rose: "via-rose-400/40",
  violet: "via-violet-400/40",
};

export function Card({
  children,
  className,
  variant = "default",
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl backdrop-blur-sm border shadow-lg shadow-black/10 transition-all duration-300",
        variantStyles[variant],
        hoverable && hoverVariantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
          glowVariantStyles[variant]
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          topLineVariantStyles[variant]
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
