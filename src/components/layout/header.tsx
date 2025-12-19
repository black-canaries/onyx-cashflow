"use client";

import { Button } from "@/components/ui/button";
import { Wallet, Upload } from "lucide-react";

interface HeaderProps {
  monthName: string;
  year: number;
  onImportClick: () => void;
}

export function Header({ monthName, year, onImportClick }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-white/10">
            <Wallet size={20} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Budget Tracker
          </h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base pl-13">
          {monthName} {year}
        </p>
      </div>
      <Button onClick={onImportClick} variant="secondary">
        <Upload size={16} className="text-slate-400 group-hover:text-teal-400 transition-colors" />
        <span>Import CSV</span>
      </Button>
    </header>
  );
}
