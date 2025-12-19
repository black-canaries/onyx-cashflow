"use client";

import { X } from "lucide-react";

interface SelectedDayBannerProps {
  selectedDay: number;
  monthName: string;
  onClear: () => void;
}

export function SelectedDayBanner({
  selectedDay,
  monthName,
  onClear,
}: SelectedDayBannerProps) {
  return (
    <div className="mb-4 flex items-center justify-between bg-amber-500/10 border border-amber-400/30 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg shadow-amber-900/10">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50" />
        <span className="text-amber-200 text-sm">
          Viewing{" "}
          <span className="font-semibold">
            {monthName} {selectedDay}
          </span>
        </span>
      </div>
      <button
        onClick={onClear}
        className="text-amber-400/80 hover:text-amber-300 transition-colors p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}
