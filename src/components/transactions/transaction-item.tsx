"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "@/types";

interface TransactionItemProps {
  transaction: Transaction;
  monthName: string;
  isHighlighted: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TransactionItem = forwardRef<HTMLDivElement, TransactionItemProps>(
  function TransactionItem(
    { transaction, monthName, isHighlighted, onClick, onEdit, onDelete },
    ref
  ) {
    const isForecast = transaction.status === "forecast";

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "group flex items-center justify-between p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200",
          isHighlighted
            ? "bg-amber-500/10 border-2 border-amber-400/40 ring-2 ring-amber-400/20 shadow-lg shadow-amber-900/20"
            : isForecast
            ? "bg-violet-950/20 border border-violet-400/20 border-dashed hover:bg-violet-950/30 hover:border-violet-400/35"
            : "bg-slate-800/30 border border-slate-500/15 hover:bg-slate-800/50 hover:border-slate-400/30"
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
              transaction.type === "income"
                ? isForecast
                  ? "bg-teal-500/10 border-teal-400/20"
                  : "bg-teal-500/20 border-teal-400/30"
                : isForecast
                ? "bg-rose-500/10 border-rose-400/20"
                : "bg-rose-500/20 border-rose-400/30"
            )}
          >
            {transaction.type === "income" ? (
              <ArrowUpRight
                size={18}
                className={isForecast ? "text-teal-400/50" : "text-teal-400"}
              />
            ) : (
              <ArrowDownRight
                size={18}
                className={isForecast ? "text-rose-400/50" : "text-rose-400"}
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "font-medium text-sm truncate",
                  isHighlighted
                    ? "text-amber-100"
                    : isForecast
                    ? "text-slate-400"
                    : "text-white"
                )}
              >
                {transaction.description}
              </p>
              {isForecast && (
                <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded-md font-medium border border-violet-400/20">
                  Forecast
                </span>
              )}
            </div>
            <p
              className={cn(
                "text-xs mt-0.5",
                isHighlighted ? "text-amber-300/70" : "text-slate-500"
              )}
            >
              {monthName.slice(0, 3)} {transaction.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span
            className={cn(
              "font-semibold text-sm",
              transaction.type === "income"
                ? isForecast
                  ? "text-teal-400/60"
                  : "text-teal-400"
                : isForecast
                ? "text-rose-400/60"
                : "text-rose-400"
            )}
          >
            {transaction.type === "income" ? "+" : "-"}£
            {transaction.amount.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-slate-500 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all border border-transparent hover:border-teal-400/30"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-400/30"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }
);
