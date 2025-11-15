"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  getPredictions,
  getRecurringRules,
  getCategories,
  addPrediction,
  addRecurringRule,
  updatePrediction,
  updateRecurringRule,
  deletePrediction,
  deleteRecurringRule,
} from "@/lib/storage";
import type { Prediction, RecurringRule, Category, RecurrenceFrequency } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ForecastsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isRecurringOpen,
    onOpen: onRecurringOpen,
    onClose: onRecurringClose,
  } = useDisclosure();

  const [newPrediction, setNewPrediction] = useState({
    date: "",
    description: "",
    amount: "",
    type: "debit" as "debit" | "credit",
    categoryId: "",
  });

  const [newRecurring, setNewRecurring] = useState({
    description: "",
    amount: "",
    type: "debit" as "debit" | "credit",
    categoryId: "",
    frequency: "monthly" as RecurrenceFrequency,
    startDate: "",
    endDate: "",
    hasEndDate: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPredictions(getPredictions().filter((p) => !p.isFromRecurring));
    setRecurringRules(getRecurringRules());
    setCategories(getCategories());
  };

  const handleAddPrediction = () => {
    if (
      !newPrediction.date ||
      !newPrediction.description ||
      !newPrediction.amount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(newPrediction.amount);
    addPrediction({
      date: new Date(newPrediction.date).toISOString(),
      description: newPrediction.description,
      amount: newPrediction.type === "debit" ? -Math.abs(amount) : Math.abs(amount),
      type: newPrediction.type,
      categoryId: newPrediction.categoryId || null,
      isFromRecurring: false,
      recurringRuleId: null,
    });

    loadData();
    onClose();
    setNewPrediction({
      date: "",
      description: "",
      amount: "",
      type: "debit",
      categoryId: "",
    });
  };

  const handleAddRecurring = () => {
    if (
      !newRecurring.description ||
      !newRecurring.amount ||
      !newRecurring.startDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(newRecurring.amount);
    addRecurringRule({
      description: newRecurring.description,
      amount: newRecurring.type === "debit" ? -Math.abs(amount) : Math.abs(amount),
      type: newRecurring.type,
      categoryId: newRecurring.categoryId || null,
      frequency: newRecurring.frequency,
      startDate: new Date(newRecurring.startDate).toISOString(),
      endDate: newRecurring.hasEndDate && newRecurring.endDate
        ? new Date(newRecurring.endDate).toISOString()
        : null,
    });

    loadData();
    onRecurringClose();
    setNewRecurring({
      description: "",
      amount: "",
      type: "debit",
      categoryId: "",
      frequency: "monthly",
      startDate: "",
      endDate: "",
      hasEndDate: false,
    });
  };

  const handleDeletePrediction = (id: string) => {
    if (confirm("Are you sure you want to delete this prediction?")) {
      deletePrediction(id);
      loadData();
    }
  };

  const handleDeleteRecurring = (id: string) => {
    if (confirm("Are you sure you want to delete this recurring rule?")) {
      deleteRecurringRule(id);
      loadData();
    }
  };

  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Forecast Management</h1>
              <p className="text-default-500 mt-1">
                Manage future predictions and recurring transactions
              </p>
            </div>
          </div>

          <Tabs aria-label="Forecast types">
            <Tab key="predictions" title="Manual Predictions">
              <Card className="mt-4">
                <CardHeader className="flex justify-between">
                  <h2 className="text-xl font-semibold">
                    Manual Predictions ({predictions.length})
                  </h2>
                  <Button color="primary" onPress={onOpen}>
                    Add Prediction
                  </Button>
                </CardHeader>
                <Divider />
                <CardBody>
                  <Table aria-label="Predictions table">
                    <TableHeader>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>DESCRIPTION</TableColumn>
                      <TableColumn>CATEGORY</TableColumn>
                      <TableColumn>AMOUNT</TableColumn>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {predictions.map((prediction) => (
                        <TableRow key={prediction.id}>
                          <TableCell>{formatDate(prediction.date)}</TableCell>
                          <TableCell>{prediction.description}</TableCell>
                          <TableCell>
                            {getCategoryName(prediction.categoryId)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                prediction.type === "credit"
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {prediction.type === "credit" ? "+" : ""}
                              {formatCurrency(Math.abs(prediction.amount))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={
                                prediction.type === "credit"
                                  ? "success"
                                  : "danger"
                              }
                              variant="flat"
                            >
                              {prediction.type}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() =>
                                handleDeletePrediction(prediction.id)
                              }
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="recurring" title="Recurring Rules">
              <Card className="mt-4">
                <CardHeader className="flex justify-between">
                  <h2 className="text-xl font-semibold">
                    Recurring Rules ({recurringRules.length})
                  </h2>
                  <Button color="primary" onPress={onRecurringOpen}>
                    Add Recurring Rule
                  </Button>
                </CardHeader>
                <Divider />
                <CardBody>
                  <Table aria-label="Recurring rules table">
                    <TableHeader>
                      <TableColumn>DESCRIPTION</TableColumn>
                      <TableColumn>FREQUENCY</TableColumn>
                      <TableColumn>AMOUNT</TableColumn>
                      <TableColumn>START DATE</TableColumn>
                      <TableColumn>END DATE</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {recurringRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.description}</TableCell>
                          <TableCell>
                            <Chip size="sm" variant="flat">
                              {rule.frequency}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                rule.type === "credit"
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {rule.type === "credit" ? "+" : ""}
                              {formatCurrency(Math.abs(rule.amount))}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(rule.startDate)}</TableCell>
                          <TableCell>
                            {rule.endDate ? formatDate(rule.endDate) : "Ongoing"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteRecurring(rule.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </main>

      {/* Add Prediction Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Add Prediction</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Date"
                type="date"
                value={newPrediction.date}
                onValueChange={(value) =>
                  setNewPrediction({ ...newPrediction, date: value })
                }
                isRequired
              />
              <Input
                label="Description"
                value={newPrediction.description}
                onValueChange={(value) =>
                  setNewPrediction({ ...newPrediction, description: value })
                }
                isRequired
              />
              <Input
                label="Amount"
                type="number"
                value={newPrediction.amount}
                onValueChange={(value) =>
                  setNewPrediction({ ...newPrediction, amount: value })
                }
                isRequired
              />
              <Select
                label="Type"
                selectedKeys={[newPrediction.type]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as "debit" | "credit";
                  setNewPrediction({ ...newPrediction, type: selected });
                }}
              >
                <SelectItem key="debit">
                  Expense (Debit)
                </SelectItem>
                <SelectItem key="credit">
                  Income (Credit)
                </SelectItem>
              </Select>
              <Select
                label="Category"
                placeholder="Select a category"
                selectedKeys={newPrediction.categoryId ? [newPrediction.categoryId] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setNewPrediction({ ...newPrediction, categoryId: selected });
                }}
              >
                {categories.map((cat) => (
                  <SelectItem key={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddPrediction}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Recurring Rule Modal */}
      <Modal isOpen={isRecurringOpen} onClose={onRecurringClose}>
        <ModalContent>
          <ModalHeader>Add Recurring Rule</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Description"
                value={newRecurring.description}
                onValueChange={(value) =>
                  setNewRecurring({ ...newRecurring, description: value })
                }
                isRequired
              />
              <Input
                label="Amount"
                type="number"
                value={newRecurring.amount}
                onValueChange={(value) =>
                  setNewRecurring({ ...newRecurring, amount: value })
                }
                isRequired
              />
              <Select
                label="Type"
                selectedKeys={[newRecurring.type]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as "debit" | "credit";
                  setNewRecurring({ ...newRecurring, type: selected });
                }}
              >
                <SelectItem key="debit">
                  Expense (Debit)
                </SelectItem>
                <SelectItem key="credit">
                  Income (Credit)
                </SelectItem>
              </Select>
              <Select
                label="Frequency"
                selectedKeys={[newRecurring.frequency]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as RecurrenceFrequency;
                  setNewRecurring({ ...newRecurring, frequency: selected });
                }}
              >
                <SelectItem key="weekly">
                  Weekly
                </SelectItem>
                <SelectItem key="biweekly">
                  Biweekly
                </SelectItem>
                <SelectItem key="monthly">
                  Monthly
                </SelectItem>
                <SelectItem key="quarterly">
                  Quarterly
                </SelectItem>
                <SelectItem key="yearly">
                  Yearly
                </SelectItem>
              </Select>
              <Input
                label="Start Date"
                type="date"
                value={newRecurring.startDate}
                onValueChange={(value) =>
                  setNewRecurring({ ...newRecurring, startDate: value })
                }
                isRequired
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newRecurring.hasEndDate}
                  onChange={(e) =>
                    setNewRecurring({
                      ...newRecurring,
                      hasEndDate: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm">Set end date</label>
              </div>
              {newRecurring.hasEndDate && (
                <Input
                  label="End Date"
                  type="date"
                  value={newRecurring.endDate}
                  onValueChange={(value) =>
                    setNewRecurring({ ...newRecurring, endDate: value })
                  }
                />
              )}
              <Select
                label="Category"
                placeholder="Select a category"
                selectedKeys={newRecurring.categoryId ? [newRecurring.categoryId] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setNewRecurring({ ...newRecurring, categoryId: selected });
                }}
              >
                {categories.map((cat) => (
                  <SelectItem key={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onRecurringClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddRecurring}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
