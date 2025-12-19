"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Plus, Calendar, Clock } from "lucide-react";
import type { NewTransaction, TransactionStatus, TransactionType } from "@/types";

interface TransactionFormProps {
  newTransaction: NewTransaction;
  onTransactionChange: (transaction: NewTransaction) => void;
  onSubmit: () => void;
  monthName: string;
  daysInMonth: number;
}

export function TransactionForm({
  newTransaction,
  onTransactionChange,
  onSubmit,
  monthName,
  daysInMonth,
}: TransactionFormProps) {
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: `${monthName.slice(0, 3)} ${i + 1}`,
  }));

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white mb-5">Add Transaction</h2>
      <div className="space-y-4">
        <ToggleGroup<TransactionStatus>
          options={[
            {
              value: "actual",
              label: "Actual",
              icon: <Calendar size={14} />,
              activeColor: "teal",
            },
            {
              value: "forecast",
              label: "Forecast",
              icon: <Clock size={14} />,
              activeColor: "violet",
            },
          ]}
          value={newTransaction.status}
          onChange={(status) =>
            onTransactionChange({ ...newTransaction, status })
          }
        />

        <ToggleGroup<TransactionType>
          options={[
            { value: "income", label: "Income", activeColor: "teal" },
            { value: "expense", label: "Expense", activeColor: "rose" },
          ]}
          value={newTransaction.type}
          onChange={(type) => onTransactionChange({ ...newTransaction, type })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Day"
            options={dayOptions}
            value={newTransaction.date}
            onChange={(e) =>
              onTransactionChange({
                ...newTransaction,
                date: parseInt(e.target.value),
              })
            }
          />
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            prefix="£"
            value={newTransaction.amount}
            onChange={(e) =>
              onTransactionChange({
                ...newTransaction,
                amount: e.target.value,
              })
            }
          />
        </div>

        <Input
          label="Description"
          type="text"
          placeholder="e.g., Salary, Groceries"
          value={newTransaction.description}
          onChange={(e) =>
            onTransactionChange({
              ...newTransaction,
              description: e.target.value,
            })
          }
        />

        <Button
          onClick={onSubmit}
          variant={newTransaction.status === "forecast" ? "violet" : "primary"}
          size="lg"
          className="w-full"
        >
          <Plus size={18} />
          Add {newTransaction.status === "forecast" ? "Forecast" : "Transaction"}
        </Button>
      </div>
    </Card>
  );
}
