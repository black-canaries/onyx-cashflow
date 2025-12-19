"use client";

import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TransactionItem } from "./transaction-item";
import { TransactionEditForm } from "./transaction-edit-form";
import { FileSpreadsheet } from "lucide-react";
import type { Transaction, EditTransaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  monthName: string;
  daysInMonth: number;
  selectedDay: number | null;
  editingId: number | null;
  editForm: EditTransaction;
  onTransactionClick: (day: number) => void;
  onEditStart: (transaction: Transaction) => void;
  onEditFormChange: (form: EditTransaction) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: (id: number) => void;
}

export function TransactionList({
  transactions,
  monthName,
  daysInMonth,
  selectedDay,
  editingId,
  editForm,
  onTransactionClick,
  onEditStart,
  onEditFormChange,
  onEditSave,
  onEditCancel,
  onDelete,
}: TransactionListProps) {
  const transactionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedDay !== null) {
      const firstTransactionForDay = transactions.find(
        (t) => t.date === selectedDay
      );
      if (
        firstTransactionForDay &&
        transactionRefs.current[firstTransactionForDay.id]
      ) {
        transactionRefs.current[firstTransactionForDay.id]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedDay, transactions]);

  const sortedTransactions = [...transactions].sort((a, b) => a.date - b.date);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Transactions</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Click to highlight &bull; Edit inline
          </p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-600/20">
          {transactions.length} items
        </span>
      </div>

      <div className="space-y-2 max-h-96 lg:max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-600/20 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet size={20} className="text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No transactions yet</p>
          </div>
        ) : (
          sortedTransactions.map((t) => {
            if (editingId === t.id) {
              return (
                <TransactionEditForm
                  key={t.id}
                  editForm={editForm}
                  onEditFormChange={onEditFormChange}
                  onSave={onEditSave}
                  onCancel={onEditCancel}
                  monthName={monthName}
                  daysInMonth={daysInMonth}
                />
              );
            }

            return (
              <TransactionItem
                key={t.id}
                ref={(el) => {
                  transactionRefs.current[t.id] = el;
                }}
                transaction={t}
                monthName={monthName}
                isHighlighted={selectedDay === t.date}
                onClick={() => onTransactionClick(t.date)}
                onEdit={() => onEditStart(t)}
                onDelete={() => onDelete(t.id)}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}
