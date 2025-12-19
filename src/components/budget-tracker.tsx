"use client";

import { useState, useMemo, useCallback } from "react";
import { Background } from "./layout/background";
import { Header } from "./layout/header";
import { SelectedDayBanner } from "./layout/selected-day-banner";
import { StatsGrid } from "./stats/stats-grid";
import { BalanceChart } from "./chart/balance-chart";
import { TransactionForm } from "./transactions/transaction-form";
import { TransactionList } from "./transactions/transaction-list";
import { ImportModal } from "./import/import-modal";
import { calculateChartData, calculateStats } from "@/lib/utils";
import { MOCK_TRANSACTIONS, INITIAL_STARTING_BALANCE, getDateInfo } from "@/lib/mock-data";
import type {
  Transaction,
  NewTransaction,
  EditTransaction,
} from "@/types";

export function BudgetTracker() {
  const { year, month, daysInMonth, today, monthName } = getDateInfo();

  const [startingBalance, setStartingBalance] = useState(INITIAL_STARTING_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    date: today,
    type: "expense",
    amount: "",
    description: "",
    status: "actual",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditTransaction>({
    date: 1,
    type: "expense",
    amount: "",
    description: "",
    status: "actual",
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showImport, setShowImport] = useState(false);

  const chartData = useMemo(
    () => calculateChartData(transactions, startingBalance, daysInMonth, today),
    [transactions, startingBalance, daysInMonth, today]
  );

  const stats = useMemo(
    () => calculateStats(transactions, startingBalance),
    [transactions, startingBalance]
  );

  const addTransaction = useCallback(() => {
    if (!newTransaction.amount || !newTransaction.description) return;
    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      },
    ]);
    setNewTransaction({
      date: today,
      type: "expense",
      amount: "",
      description: "",
      status: "actual",
    });
  }, [newTransaction, today]);

  const removeTransaction = useCallback(
    (id: number) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) setEditingId(null);
    },
    [editingId]
  );

  const startEditing = useCallback((transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      date: transaction.date,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      status: transaction.status,
    });
  }, []);

  const saveEdit = useCallback(() => {
    if (!editForm.amount || !editForm.description) return;
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? { ...t, ...editForm, amount: parseFloat(editForm.amount) }
          : t
      )
    );
    setEditingId(null);
  }, [editForm, editingId]);

  const handleTransactionClick = useCallback(
    (day: number) => {
      if (editingId) return;
      setSelectedDay((prev) => (prev === day ? null : day));
    },
    [editingId]
  );

  const handleDaySelect = useCallback(
    (day: number | null) => {
      if (editingId) return;
      setSelectedDay(day);
    },
    [editingId]
  );

  const handleImport = useCallback((importedTransactions: Transaction[]) => {
    setTransactions((prev) => [...prev, ...importedTransactions]);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white font-sans">
      <Background />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Header
          monthName={monthName}
          year={year}
          onImportClick={() => setShowImport(true)}
        />

        <StatsGrid
          stats={stats}
          startingBalance={startingBalance}
          onStartingBalanceChange={setStartingBalance}
        />

        {selectedDay !== null && (
          <SelectedDayBanner
            selectedDay={selectedDay}
            monthName={monthName}
            onClear={() => setSelectedDay(null)}
          />
        )}

        <BalanceChart
          chartData={chartData}
          transactions={transactions}
          today={today}
          monthName={monthName}
          selectedDay={selectedDay}
          onDaySelect={handleDaySelect}
          editingId={editingId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TransactionForm
            newTransaction={newTransaction}
            onTransactionChange={setNewTransaction}
            onSubmit={addTransaction}
            monthName={monthName}
            daysInMonth={daysInMonth}
          />

          <TransactionList
            transactions={transactions}
            monthName={monthName}
            daysInMonth={daysInMonth}
            selectedDay={selectedDay}
            editingId={editingId}
            editForm={editForm}
            onTransactionClick={handleTransactionClick}
            onEditStart={startEditing}
            onEditFormChange={setEditForm}
            onEditSave={saveEdit}
            onEditCancel={() => setEditingId(null)}
            onDelete={removeTransaction}
          />
        </div>
      </div>

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        today={today}
        month={month}
        year={year}
        daysInMonth={daysInMonth}
        monthName={monthName}
      />
    </div>
  );
}
