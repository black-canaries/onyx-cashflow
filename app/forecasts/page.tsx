"use client";
import { NavBar } from "@/components/NavBar";
import { Card, Text } from "@tremor/react";

export default function ForecastsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Forecast Management</h1>
        <Card>
          <Text>Forecast management coming soon...</Text>
        </Card>
      </main>
    </div>
  );
}
