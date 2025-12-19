import type { Transaction } from "@/types";

const currentDate = new Date();
const today = currentDate.getDate();

export const INITIAL_STARTING_BALANCE = 1000;

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    date: Math.min(5, today),
    type: "income",
    amount: 2500,
    description: "Salary",
    status: "actual",
  },
  {
    id: 2,
    date: Math.min(8, today),
    type: "expense",
    amount: 150,
    description: "Utilities",
    status: "actual",
  },
  {
    id: 3,
    date: Math.min(12, today),
    type: "expense",
    amount: 400,
    description: "Groceries",
    status: "actual",
  },
  {
    id: 4,
    date: 20,
    type: "income",
    amount: 2500,
    description: "Salary (Expected)",
    status: "forecast",
  },
  {
    id: 5,
    date: 25,
    type: "expense",
    amount: 800,
    description: "Rent",
    status: "forecast",
  },
  {
    id: 6,
    date: Math.min(3, today),
    type: "expense",
    amount: 45,
    description: "Streaming Services",
    status: "actual",
  },
  {
    id: 7,
    date: Math.min(10, today),
    type: "expense",
    amount: 120,
    description: "Phone Bill",
    status: "actual",
  },
  {
    id: 8,
    date: 28,
    type: "expense",
    amount: 200,
    description: "Insurance",
    status: "forecast",
  },
];

export function getDateInfo() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = currentDate.getDate();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return { year, month, daysInMonth, today, monthName, currentDate };
}
