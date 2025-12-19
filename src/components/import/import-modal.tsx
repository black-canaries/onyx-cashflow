"use client";

import { useRef, useState, useCallback } from "react";
import * as Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  X,
  FileSpreadsheet,
  Upload,
  AlertCircle,
  Check,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnMapping, MappedTransaction, Transaction } from "@/types";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
  today: number;
  month: number;
  year: number;
  daysInMonth: number;
  monthName: string;
}

export function ImportModal({
  isOpen,
  onClose,
  onImport,
  today,
  month,
  year,
  daysInMonth,
  monthName,
}: ImportModalProps) {
  const [importStep, setImportStep] = useState(1);
  const [csvData, setCsvData] = useState<Record<string, string>[] | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: "",
    amount: "",
    description: "",
    type: "",
  });
  const [mappedTransactions, setMappedTransactions] = useState<MappedTransaction[]>([]);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImport = useCallback(() => {
    setImportStep(1);
    setCsvData(null);
    setCsvHeaders([]);
    setColumnMapping({ date: "", amount: "", description: "", type: "" });
    setMappedTransactions([]);
    setImportError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }, [onClose]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setImportError("Error parsing CSV file.");
          return;
        }
        setCsvData(results.data);
        setCsvHeaders(results.meta.fields || []);
        const headers = results.meta.fields || [];
        const autoMapping: ColumnMapping = {
          date: "",
          amount: "",
          description: "",
          type: "",
        };
        headers.forEach((h) => {
          const lower = h.toLowerCase();
          if (lower.includes("date") && !autoMapping.date) autoMapping.date = h;
          if ((lower === "amount" || lower.includes("money")) && !autoMapping.amount)
            autoMapping.amount = h;
          if (
            (lower.includes("name") ||
              lower.includes("description") ||
              lower === "merchant") &&
            !autoMapping.description
          )
            autoMapping.description = h;
          if (lower === "type" || lower === "category") autoMapping.type = h;
        });
        setColumnMapping(autoMapping);
        setImportStep(2);
      },
      error: () => setImportError("Failed to read the file."),
    });
  };

  const processMapping = () => {
    if (!columnMapping.date || !columnMapping.amount || !columnMapping.description) {
      setImportError("Please map all required fields");
      return;
    }
    if (!csvData) return;
    setImportError("");

    const processed: MappedTransaction[] = csvData
      .map((row, index) => {
        const dateStr = row[columnMapping.date];
        let day = today;
        if (dateStr) {
          const parsed = new Date(dateStr);
          if (
            !isNaN(parsed.getTime()) &&
            parsed.getMonth() === month &&
            parsed.getFullYear() === year
          ) {
            day = parsed.getDate();
          } else {
            const parts = dateStr.split(/[/-]/);
            if (parts.length === 3) {
              const d = parseInt(parts[0]);
              const m = parseInt(parts[1]) - 1;
              const y = parseInt(
                parts[2].length === 2 ? "20" + parts[2] : parts[2]
              );
              if (m === month && y === year && d >= 1 && d <= daysInMonth)
                day = d;
            }
          }
        }
        const amountStr = (row[columnMapping.amount] || "0")
          .replace(/[£$€,]/g, "")
          .trim();
        const amount = parseFloat(amountStr) || 0;
        let type: "income" | "expense" = "expense";
        if (columnMapping.type && row[columnMapping.type]) {
          const typeVal = row[columnMapping.type].toLowerCase();
          if (
            typeVal.includes("income") ||
            typeVal.includes("credit") ||
            typeVal.includes("salary")
          )
            type = "income";
        } else {
          type = amount >= 0 ? "income" : "expense";
        }
        return {
          id: Date.now() + index,
          date: day,
          amount: Math.abs(amount),
          description: row[columnMapping.description] || "Imported",
          type,
          status: "actual" as const,
          selected: true,
        };
      })
      .filter((t) => t.amount > 0);

    setMappedTransactions(processed);
    setImportStep(3);
  };

  const importTransactions = () => {
    const toImport: Transaction[] = mappedTransactions
      .filter((t) => t.selected)
      .map((t) => ({
        id: t.id,
        date: t.date,
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
      }));
    onImport(toImport);
    resetImport();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 w-full sm:w-auto sm:min-w-[420px] sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col border border-slate-600/30 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-400/30">
              <FileSpreadsheet className="text-teal-400" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Import CSV</h2>
              <p className="text-xs text-slate-500">From your bank account</p>
            </div>
          </div>
          <button
            onClick={resetImport}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-600/30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1 gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all border",
                  importStep >= step
                    ? "bg-teal-500 text-white border-teal-400/50 shadow-lg shadow-teal-500/30"
                    : "bg-slate-800 text-slate-500 border-slate-600/30"
                )}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 rounded-full",
                    importStep > step ? "bg-teal-500" : "bg-slate-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {importError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
              <AlertCircle size={16} />
              {importError}
            </div>
          )}

          {importStep === 1 && (
            <div className="text-center py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600/50 rounded-2xl p-10 cursor-pointer hover:border-teal-400/50 hover:bg-teal-500/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-600/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/10 group-hover:border-teal-400/30 transition-colors">
                  <Upload
                    size={24}
                    className="text-slate-500 group-hover:text-teal-400 transition-colors"
                  />
                </div>
                <p className="text-white font-medium mb-1">
                  Upload your CSV file
                </p>
                <p className="text-slate-500 text-sm">
                  Click to browse or drag and drop
                </p>
              </div>
              <p className="text-slate-600 text-xs mt-4">
                Export from your bank &rarr; Download statement
              </p>
            </div>
          )}

          {importStep === 2 && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                Map your CSV columns to import correctly.
              </p>
              {(
                [
                  { key: "date", label: "Date Column", required: true },
                  { key: "amount", label: "Amount Column", required: true },
                  { key: "description", label: "Description Column", required: true },
                  { key: "type", label: "Type Column", required: false },
                ] as const
              ).map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    {field.label}
                    {field.required && (
                      <span className="text-rose-400 ml-1">*</span>
                    )}
                  </label>
                  <Select
                    options={[
                      { value: "", label: "Select column..." },
                      ...csvHeaders.map((h) => ({ value: h, label: h })),
                    ]}
                    value={columnMapping[field.key]}
                    onChange={(e) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {importStep === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-sm">
                  {mappedTransactions.filter((t) => t.selected).length} of{" "}
                  {mappedTransactions.length} selected
                </p>
                <button
                  onClick={() =>
                    setMappedTransactions((prev) =>
                      prev.map((t) => ({
                        ...t,
                        selected: !prev.every((p) => p.selected),
                      }))
                    )
                  }
                  className="text-xs text-teal-400 hover:text-teal-300 px-2 py-1 rounded-lg hover:bg-teal-500/10 transition-all"
                >
                  Toggle all
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mappedTransactions.map((t) => (
                  <div
                    key={t.id}
                    onClick={() =>
                      setMappedTransactions((prev) =>
                        prev.map((p) =>
                          p.id === t.id ? { ...p, selected: !p.selected } : p
                        )
                      )
                    }
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                      t.selected
                        ? "bg-slate-800/60 border-slate-500/25"
                        : "bg-slate-800/20 border-transparent opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                        t.selected
                          ? "bg-teal-500 border-teal-400"
                          : "border-slate-600"
                      )}
                    >
                      {t.selected && <Check size={12} className="text-white" />}
                    </div>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center border",
                        t.type === "income"
                          ? "bg-teal-500/20 border-teal-400/30"
                          : "bg-rose-500/20 border-rose-400/30"
                      )}
                    >
                      {t.type === "income" ? (
                        <ArrowUpRight size={14} className="text-teal-400" />
                      ) : (
                        <ArrowDownRight size={14} className="text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {t.description}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {monthName} {t.date}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        t.type === "income" ? "text-teal-400" : "text-rose-400"
                      )}
                    >
                      {t.type === "income" ? "+" : "-"}£{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700/50 flex gap-3">
          {importStep > 1 && (
            <Button
              onClick={() => setImportStep((prev) => prev - 1)}
              variant="secondary"
              className="flex-1 py-3"
            >
              Back
            </Button>
          )}
          {importStep === 2 && (
            <Button onClick={processMapping} className="flex-1 py-3">
              Continue
            </Button>
          )}
          {importStep === 3 && (
            <Button
              onClick={importTransactions}
              disabled={!mappedTransactions.some((t) => t.selected)}
              className="flex-1 py-3"
            >
              Import {mappedTransactions.filter((t) => t.selected).length}{" "}
              Transactions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
