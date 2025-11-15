"use client";

import { Button, ButtonGroup } from "@heroui/react";
import type { TimePeriod } from "@/lib/types";

interface TimePeriodSelectorProps {
  selected: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const periods: { value: TimePeriod; label: string }[] = [
  { value: "1week", label: "1W" },
  { value: "1month", label: "1M" },
  { value: "3months", label: "3M" },
  { value: "6months", label: "6M" },
  { value: "9months", label: "9M" },
  { value: "1year", label: "1Y" },
];

export function TimePeriodSelector({ selected, onChange }: TimePeriodSelectorProps) {
  return (
    <ButtonGroup size="sm" variant="flat">
      {periods.map((period) => (
        <Button
          key={period.value}
          color={selected === period.value ? "primary" : "default"}
          variant={selected === period.value ? "solid" : "flat"}
          onPress={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
