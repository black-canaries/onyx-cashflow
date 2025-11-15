import type {
  LocalStorageData,
  Transaction,
  Category,
  RecurringRule,
  Prediction,
  TimePeriod,
} from "./types";

const STORAGE_KEY = "onyx-cashflow-data";

// Default empty data structure
const getDefaultData = (): LocalStorageData => ({
  transactions: [],
  categories: [],
  recurringRules: [],
  predictions: [],
  settings: {
    theme: "dark",
    defaultTimePeriod: "1month",
  },
});

// Get all data from LocalStorage
export const loadData = (): LocalStorageData => {
  if (typeof window === "undefined") {
    return getDefaultData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultData();
    }
    return JSON.parse(stored) as LocalStorageData;
  } catch (error) {
    console.error("Error loading data from LocalStorage:", error);
    return getDefaultData();
  }
};

// Save all data to LocalStorage
export const saveData = (data: LocalStorageData): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data to LocalStorage:", error);
  }
};

// Transaction operations
export const getTransactions = (): Transaction[] => {
  return loadData().transactions;
};

export const addTransaction = (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Transaction => {
  const data = loadData();
  const now = new Date().toISOString();
  const newTransaction: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.transactions.push(newTransaction);
  saveData(data);
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Omit<Transaction, "id" | "createdAt">>): Transaction | null => {
  const data = loadData();
  const index = data.transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updatedTransaction = {
    ...data.transactions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  data.transactions[index] = updatedTransaction;
  saveData(data);
  return updatedTransaction;
};

export const deleteTransaction = (id: string): boolean => {
  const data = loadData();
  const initialLength = data.transactions.length;
  data.transactions = data.transactions.filter((t) => t.id !== id);
  if (data.transactions.length < initialLength) {
    saveData(data);
    return true;
  }
  return false;
};

export const bulkUpdateTransactions = (ids: string[], updates: Partial<Omit<Transaction, "id" | "createdAt">>): number => {
  const data = loadData();
  const now = new Date().toISOString();
  let updateCount = 0;

  data.transactions = data.transactions.map((t) => {
    if (ids.includes(t.id)) {
      updateCount++;
      return { ...t, ...updates, updatedAt: now };
    }
    return t;
  });

  saveData(data);
  return updateCount;
};

// Category operations
export const getCategories = (): Category[] => {
  return loadData().categories;
};

export const addCategory = (category: Omit<Category, "id" | "createdAt">): Category => {
  const data = loadData();
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.categories.push(newCategory);
  saveData(data);
  return newCategory;
};

export const updateCategory = (id: string, updates: Partial<Omit<Category, "id" | "createdAt">>): Category | null => {
  const data = loadData();
  const index = data.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updatedCategory = { ...data.categories[index], ...updates };
  data.categories[index] = updatedCategory;
  saveData(data);
  return updatedCategory;
};

export const deleteCategory = (id: string): boolean => {
  const data = loadData();
  const initialLength = data.categories.length;
  data.categories = data.categories.filter((c) => c.id !== id);
  if (data.categories.length < initialLength) {
    saveData(data);
    return true;
  }
  return false;
};

// Recurring rule operations
export const getRecurringRules = (): RecurringRule[] => {
  return loadData().recurringRules;
};

export const addRecurringRule = (rule: Omit<RecurringRule, "id" | "createdAt" | "updatedAt">): RecurringRule => {
  const data = loadData();
  const now = new Date().toISOString();
  const newRule: RecurringRule = {
    ...rule,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.recurringRules.push(newRule);
  saveData(data);
  return newRule;
};

export const updateRecurringRule = (id: string, updates: Partial<Omit<RecurringRule, "id" | "createdAt">>): RecurringRule | null => {
  const data = loadData();
  const index = data.recurringRules.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedRule = {
    ...data.recurringRules[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  data.recurringRules[index] = updatedRule;
  saveData(data);
  return updatedRule;
};

export const deleteRecurringRule = (id: string): boolean => {
  const data = loadData();
  const initialLength = data.recurringRules.length;
  data.recurringRules = data.recurringRules.filter((r) => r.id !== id);
  if (data.recurringRules.length < initialLength) {
    saveData(data);
    return true;
  }
  return false;
};

// Prediction operations
export const getPredictions = (): Prediction[] => {
  return loadData().predictions;
};

export const addPrediction = (prediction: Omit<Prediction, "id" | "createdAt" | "updatedAt">): Prediction => {
  const data = loadData();
  const now = new Date().toISOString();
  const newPrediction: Prediction = {
    ...prediction,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.predictions.push(newPrediction);
  saveData(data);
  return newPrediction;
};

export const updatePrediction = (id: string, updates: Partial<Omit<Prediction, "id" | "createdAt">>): Prediction | null => {
  const data = loadData();
  const index = data.predictions.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedPrediction = {
    ...data.predictions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  data.predictions[index] = updatedPrediction;
  saveData(data);
  return updatedPrediction;
};

export const deletePrediction = (id: string): boolean => {
  const data = loadData();
  const initialLength = data.predictions.length;
  data.predictions = data.predictions.filter((p) => p.id !== id);
  if (data.predictions.length < initialLength) {
    saveData(data);
    return true;
  }
  return false;
};

// Settings operations
export const getSettings = () => {
  return loadData().settings;
};

export const updateSettings = (updates: Partial<LocalStorageData["settings"]>): void => {
  const data = loadData();
  data.settings = { ...data.settings, ...updates };
  saveData(data);
};

// Bulk operations
export const clearAllData = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const importData = (data: LocalStorageData): void => {
  saveData(data);
};

export const exportData = (): LocalStorageData => {
  return loadData();
};
