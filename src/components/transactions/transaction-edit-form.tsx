"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Calendar, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditTransaction, TransactionStatus, TransactionType } from "@/types";

interface TransactionEditFormProps {
  editForm: EditTransaction;
  onEditFormChange: (form: EditTransaction) => void;
  onSave: () => void;
  onCancel: () => void;
  monthName: string;
  daysInMonth: number;
}

export function TransactionEditForm({
  editForm,
  onEditFormChange,
  onSave,
  onCancel,
  monthName,
  daysInMonth,
}: TransactionEditFormProps) {
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: `${monthName.slice(0, 3)} ${i + 1}`,
  }));

  const handleStatusChange = (status: TransactionStatus) => {
    onEditFormChange({ ...editForm, status });
  };

  const handleTypeChange = (type: TransactionType) => {
    onEditFormChange({ ...editForm, type });
  };

  return (
    <div className="p-4 bg-slate-800/80 rounded-xl border-2 border-teal-400/50 shadow-lg shadow-teal-900/20 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleStatusChange("actual")}
          className={cn(
            "py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all border",
            editForm.status === "actual"
              ? "bg-teal-500/20 text-teal-400 border-teal-400/30"
              : "bg-slate-700/50 text-slate-400 border-transparent"
          )}
        >
          <Calendar size={12} /> Actual
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("forecast")}
          className={cn(
            "py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all border",
            editForm.status === "forecast"
              ? "bg-violet-500/20 text-violet-400 border-violet-400/30"
              : "bg-slate-700/50 text-slate-400 border-transparent"
          )}
        >
          <Clock size={12} /> Forecast
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={cn(
            "py-2 rounded-lg text-xs font-medium border",
            editForm.type === "income"
              ? "bg-teal-500/20 text-teal-400 border-teal-400/30"
              : "bg-slate-700/50 text-slate-400 border-transparent"
          )}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("expense")}
          className={cn(
            "py-2 rounded-lg text-xs font-medium border",
            editForm.type === "expense"
              ? "bg-rose-500/20 text-rose-400 border-rose-400/30"
              : "bg-slate-700/50 text-slate-400 border-transparent"
          )}
        >
          Expense
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select
          options={dayOptions}
          value={editForm.date}
          onChange={(e) =>
            onEditFormChange({ ...editForm, date: parseInt(e.target.value) })
          }
          className="p-2.5 bg-slate-700/50 border-slate-500/30"
        />
        <Input
          type="number"
          value={editForm.amount}
          onChange={(e) =>
            onEditFormChange({ ...editForm, amount: e.target.value })
          }
          placeholder="Amount"
          className="p-2.5 bg-slate-700/50 border-slate-500/30"
        />
      </div>
      <Input
        type="text"
        value={editForm.description}
        onChange={(e) =>
          onEditFormChange({ ...editForm, description: e.target.value })
        }
        placeholder="Description"
        className="w-full p-2.5 bg-slate-700/50 border-slate-500/30"
      />
      <div className="flex gap-2">
        <Button onClick={onSave} variant="primary" className="flex-1 py-2.5">
          <Check size={14} /> Save
        </Button>
        <Button onClick={onCancel} variant="secondary" className="flex-1 py-2.5">
          Cancel
        </Button>
      </div>
    </div>
  );
}
