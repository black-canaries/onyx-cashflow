import { Dashboard } from "@/components/Dashboard";
import { NavBar } from "@/components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Dashboard />
      </main>
    </div>
  );
}
