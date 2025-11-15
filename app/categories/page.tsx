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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/storage";
import type { Category } from "@/lib/types";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: PRESET_COLORS[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(getCategories());
  };

  const handleAdd = () => {
    if (!newCategory.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    addCategory({
      name: newCategory.name,
      color: newCategory.color,
    });

    loadData();
    onClose();
    setNewCategory({ name: "", color: PRESET_COLORS[0] });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, color: category.color });
    onOpen();
  };

  const handleUpdate = () => {
    if (!editingCategory || !newCategory.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    updateCategory(editingCategory.id, {
      name: newCategory.name,
      color: newCategory.color,
    });

    loadData();
    onClose();
    setEditingCategory(null);
    setNewCategory({ name: "", color: PRESET_COLORS[0] });
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this category? Transactions with this category will become uncategorized."
      )
    ) {
      deleteCategory(id);
      loadData();
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setNewCategory({ name: "", color: PRESET_COLORS[0] });
    onOpen();
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Category Management</h1>
              <p className="text-default-500 mt-1">
                Create and manage transaction categories
              </p>
            </div>
            <Button color="primary" size="lg" onPress={handleOpenAdd}>
              Add Category
            </Button>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Categories ({categories.length})
              </h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <Table aria-label="Categories table">
                <TableHeader>
                  <TableColumn>COLOR</TableColumn>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>CREATED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div
                          className="w-8 h-8 rounded-full border-2 border-divider"
                          style={{ backgroundColor: category.color }}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{category.name}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => handleEdit(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDelete(category.id)}
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

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">About Categories</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-2 text-sm text-default-600">
                <p>
                  Categories help you organize your transactions and understand
                  your spending patterns.
                </p>
                <p>
                  You can assign categories to transactions when importing CSV
                  files or manually through the Transaction Management page.
                </p>
                <p>
                  Use the bulk categorization feature to quickly categorize
                  multiple transactions at once.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>

      {/* Add/Edit Category Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {editingCategory ? "Edit Category" : "Add Category"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Category Name"
                placeholder="e.g., Groceries, Rent, Entertainment"
                value={newCategory.name}
                onValueChange={(value) =>
                  setNewCategory({ ...newCategory, name: value })
                }
                isRequired
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setNewCategory({ ...newCategory, color })
                      }
                      className={`w-12 h-12 rounded-lg transition-transform hover:scale-110 ${
                        newCategory.color === color
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Custom Color
                </label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, color: e.target.value })
                  }
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-default-100 rounded-lg">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: newCategory.color }}
                />
                <span className="font-semibold">{newCategory.name || "Preview"}</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={editingCategory ? handleUpdate : handleAdd}
            >
              {editingCategory ? "Update" : "Add"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
