"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Card, Button, TextInput, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/storage";
import type { Category } from "@/lib/types";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", color: PRESET_COLORS[0] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => setCategories(getCategories());

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }

    loadData();
    setIsOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", color: PRESET_COLORS[0] });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure? Transactions with this category will become uncategorized.")) {
      deleteCategory(id);
      loadData();
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", color: PRESET_COLORS[0] });
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Category Management</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Create and manage transaction categories
              </p>
            </div>
            <Button size="lg" onClick={handleOpenAdd}>
              Add Category
            </Button>
          </div>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Categories ({categories.length})
            </h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Color</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
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
                        <Button size="xs" variant="secondary" onClick={() => handleEdit(category)}>
                          Edit
                        </Button>
                        <Button size="xs" variant="secondary" color="red" onClick={() => handleDelete(category.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingCategory ? "Edit Category" : "Add Category"}
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category Name
                      </label>
                      <TextInput
                        placeholder="e.g., Groceries, Rent"
                        value={formData.name}
                        onValueChange={(value) => setFormData({ ...formData, name: value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-12 h-12 rounded-lg transition-transform hover:scale-110 ${
                              formData.color === color ? "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900" : ""
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Custom Color
                      </label>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: formData.color }} />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formData.name || "Preview"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingCategory ? "Update" : "Add"}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
