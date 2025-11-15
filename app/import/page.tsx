"use client";

import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from "@heroui/react";
import { addTransaction, getCategories } from "@/lib/storage";
import type { Category } from "@/lib/types";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<{
    date: string;
    description: string;
    amount: string;
    type?: string;
  }>({
    date: "",
    description: "",
    amount: "",
    type: "",
  });
  const [categories] = useState<Category[]>(getCategories());
  const [importing, setImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setImportComplete(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) return;

      const csvHeaders = lines[0].split(",").map((h) => h.trim());
      const csvRows = lines.slice(1, 11).map((line) =>
        line.split(",").map((cell) => cell.trim())
      );

      setHeaders(csvHeaders);
      setRows(csvRows);

      // Auto-detect common column names
      const autoMapping = {
        date: csvHeaders.find(
          (h) =>
            h.toLowerCase().includes("date") ||
            h.toLowerCase().includes("time")
        ) || "",
        description: csvHeaders.find(
          (h) =>
            h.toLowerCase().includes("description") ||
            h.toLowerCase().includes("name") ||
            h.toLowerCase().includes("merchant")
        ) || "",
        amount: csvHeaders.find(
          (h) =>
            h.toLowerCase().includes("amount") ||
            h.toLowerCase().includes("value") ||
            h.toLowerCase().includes("balance")
        ) || "",
        type: csvHeaders.find(
          (h) =>
            h.toLowerCase().includes("type") ||
            h.toLowerCase().includes("debit") ||
            h.toLowerCase().includes("credit")
        ) || "",
      };

      setMapping(autoMapping);
    };

    reader.readAsText(uploadedFile);
  };

  const handleImport = async () => {
    if (!mapping.date || !mapping.description || !mapping.amount) {
      alert("Please map required fields: date, description, and amount");
      return;
    }

    setImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        const csvHeaders = lines[0].split(",").map((h) => h.trim());
        const csvRows = lines.slice(1).map((line) =>
          line.split(",").map((cell) => cell.trim())
        );

        const dateIndex = csvHeaders.indexOf(mapping.date);
        const descIndex = csvHeaders.indexOf(mapping.description);
        const amountIndex = csvHeaders.indexOf(mapping.amount);
        const typeIndex = mapping.type ? csvHeaders.indexOf(mapping.type) : -1;

        let imported = 0;

        csvRows.forEach((row) => {
          if (row.length < csvHeaders.length) return;

          const dateStr = row[dateIndex];
          const description = row[descIndex];
          const amountStr = row[amountIndex];

          // Parse date
          let date: Date;
          try {
            date = new Date(dateStr);
            if (isNaN(date.getTime())) throw new Error("Invalid date");
          } catch {
            return;
          }

          // Parse amount
          const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, ""));
          if (isNaN(amount)) return;

          // Determine type
          let type: "debit" | "credit" = "debit";
          if (typeIndex >= 0) {
            const typeStr = row[typeIndex].toLowerCase();
            type = typeStr.includes("credit") || typeStr.includes("deposit")
              ? "credit"
              : "debit";
          } else {
            type = amount > 0 ? "credit" : "debit";
          }

          // Add transaction
          addTransaction({
            date: date.toISOString(),
            description,
            amount: type === "debit" ? -Math.abs(amount) : Math.abs(amount),
            type,
            categoryId: null,
          });

          imported++;
        });

        setImporting(false);
        setImportComplete(true);
        alert(`Successfully imported ${imported} transactions!`);
      };

      if (file) {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error("Import error:", error);
      setImporting(false);
      alert("Error importing file. Please check the format and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Import Transactions</h1>
            <p className="text-default-500 mt-1">
              Upload a CSV file and map columns to import transactions
            </p>
          </div>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">1. Upload CSV File</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-default-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90
                  cursor-pointer"
              />
              {file && (
                <p className="mt-2 text-sm text-success">
                  Loaded: {file.name} ({headers.length} columns, {rows.length}+ rows)
                </p>
              )}
            </CardBody>
          </Card>

          {/* Column Mapping */}
          {headers.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">2. Map CSV Columns</h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <Select
                  label="Date Column"
                  placeholder="Select the date column"
                  selectedKeys={mapping.date ? [mapping.date] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setMapping({ ...mapping, date: selected });
                  }}
                  isRequired
                >
                  {headers.map((header) => (
                    <SelectItem key={header}>
                      {header}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Description Column"
                  placeholder="Select the description column"
                  selectedKeys={mapping.description ? [mapping.description] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setMapping({ ...mapping, description: selected });
                  }}
                  isRequired
                >
                  {headers.map((header) => (
                    <SelectItem key={header}>
                      {header}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Amount Column"
                  placeholder="Select the amount column"
                  selectedKeys={mapping.amount ? [mapping.amount] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setMapping({ ...mapping, amount: selected });
                  }}
                  isRequired
                >
                  {headers.map((header) => (
                    <SelectItem key={header}>
                      {header}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Type Column (Optional)"
                  placeholder="Select the transaction type column"
                  selectedKeys={mapping.type ? [mapping.type] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setMapping({ ...mapping, type: selected });
                  }}
                >
                  {headers.map((header) => (
                    <SelectItem key={header}>
                      {header}
                    </SelectItem>
                  ))}
                </Select>

                <p className="text-sm text-default-500">
                  Note: If type column is not specified, negative amounts will be
                  treated as debits and positive as credits.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">3. Preview Data</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                <Table aria-label="CSV preview" className="max-h-96 overflow-auto">
                  <TableHeader>
                    {headers.map((header, idx) => (
                      <TableColumn key={idx}>{header}</TableColumn>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={idx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="mt-4 text-sm text-default-500">
                  Showing first 10 rows. All rows will be imported.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Import Button */}
          {headers.length > 0 && (
            <div className="flex justify-end gap-3">
              <Button
                color="primary"
                size="lg"
                onPress={handleImport}
                isLoading={importing}
                isDisabled={!mapping.date || !mapping.description || !mapping.amount}
              >
                {importComplete ? "Import More" : "Import Transactions"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
