"use client";

import { useState, useEffect, useMemo } from "react";
import { NavBar } from "@/components/NavBar";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Select,
  SelectItem,
  Input,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  getTransactions,
  getCategories,
  updateTransaction,
  deleteTransaction,
  bulkUpdateTransactions,
} from "@/lib/storage";
import type { Transaction, Category } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(getTransactions());
    setCategories(getCategories());
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesCategory =
        filterCategory === "all" || t.categoryId === filterCategory;
      const matchesSearch =
        searchQuery === "" ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [transactions, filterCategory, searchQuery]);

  const handleBulkCategorize = (categoryId: string) => {
    const ids = Array.from(selectedKeys);
    bulkUpdateTransactions(ids, { categoryId });
    loadData();
    setSelectedKeys(new Set());
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
      loadData();
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    onOpen();
  };

  const handleSaveEdit = () => {
    if (!editingTransaction) return;

    updateTransaction(editingTransaction.id, {
      description: editingTransaction.description,
      amount: editingTransaction.amount,
      categoryId: editingTransaction.categoryId,
    });

    loadData();
    onClose();
    setEditingTransaction(null);
  };

  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string | null): string => {
    if (!categoryId) return "#6b7280";
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#6b7280";
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Transaction Management</h1>
            <p className="text-default-500 mt-1">
              View, edit, and categorize your transactions
            </p>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="flex-1"
                  isClearable
                />
                <Select
                  label="Filter by Category"
                  placeholder="All Categories"
                  selectedKeys={[filterCategory]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterCategory(selected);
                  }}
                  className="w-full md:w-64"
                >
                  {[{ id: "all", name: "All Categories" }, ...categories].map((cat) => (
                    <SelectItem key={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {selectedKeys.size > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm text-default-500">
                    {selectedKeys.size} selected
                  </span>
                  <Select
                    placeholder="Bulk categorize..."
                    className="w-64"
                    onSelectionChange={(keys) => {
                      const categoryId = Array.from(keys)[0] as string;
                      if (categoryId) handleBulkCategorize(categoryId);
                    }}
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Transactions ({filteredTransactions.length})
              </h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <Table
                aria-label="Transactions table"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={(keys) =>
                  setSelectedKeys(keys as Set<string>)
                }
              >
                <TableHeader>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>DESCRIPTION</TableColumn>
                  <TableColumn>CATEGORY</TableColumn>
                  <TableColumn>AMOUNT</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getCategoryColor(
                                transaction.categoryId
                              ),
                            }}
                          />
                          <span className="text-sm">
                            {getCategoryName(transaction.categoryId)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            transaction.type === "credit"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : ""}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={
                            transaction.type === "credit" ? "success" : "danger"
                          }
                          variant="flat"
                        >
                          {transaction.type}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => handleEdit(transaction)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDelete(transaction.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </main>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Edit Transaction</ModalHeader>
          <ModalBody>
            {editingTransaction && (
              <div className="space-y-4">
                <Input
                  label="Description"
                  value={editingTransaction.description}
                  onValueChange={(value) =>
                    setEditingTransaction({
                      ...editingTransaction,
                      description: value,
                    })
                  }
                />
                <Input
                  label="Amount"
                  type="number"
                  value={Math.abs(editingTransaction.amount).toString()}
                  onValueChange={(value) =>
                    setEditingTransaction({
                      ...editingTransaction,
                      amount:
                        editingTransaction.type === "debit"
                          ? -Math.abs(parseFloat(value))
                          : Math.abs(parseFloat(value)),
                    })
                  }
                />
                <Select
                  label="Category"
                  placeholder="Select a category"
                  selectedKeys={
                    editingTransaction.categoryId
                      ? [editingTransaction.categoryId]
                      : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setEditingTransaction({
                      ...editingTransaction,
                      categoryId: selected || null,
                    });
                  }}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveEdit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
