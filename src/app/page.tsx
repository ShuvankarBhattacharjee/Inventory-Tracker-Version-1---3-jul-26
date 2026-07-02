import { DashboardManager } from "@/components/dashboard/dashboard-manager";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SS OM Bharat Logo" className="h-12 w-auto object-contain" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              SS OM Bharat <span className="text-emerald-600 font-light ml-2">| Sales & Inventory</span>
            </h1>
          </div>
        </header>
        
        <DashboardManager />
      </div>
    </main>
  );
}
