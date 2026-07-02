"use client";

import { useState } from "react";
import { StockEntryForm } from "./stock-entry-form";
import { InventoryCards } from "./inventory-cards";
import { InventoryItem, MushroomVariety } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Initial dummy data
const initialInventory: InventoryItem[] = [
  {
    id: "1",
    variety: "Button",
    purchased: 150,
    ownProduction: 50,
    packedQuantity: 120,
    totalAvailable: 200,
    remaining: 80,
    date: new Date().toISOString(),
  },
  {
    id: "2",
    variety: "Oyster",
    purchased: 40,
    ownProduction: 80,
    packedQuantity: 90,
    totalAvailable: 120,
    remaining: 30,
    date: new Date().toISOString(),
  }
];

export function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const handleAddStock = (variety: MushroomVariety, purchased: number, ownProduction: number) => {
    // Check if entry for today already exists for this variety
    const today = new Date().toDateString();
    const existingIndex = inventory.findIndex(
      item => item.variety === variety && new Date(item.date).toDateString() === today
    );

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...inventory];
      const item = updated[existingIndex];
      item.purchased += purchased;
      item.ownProduction += ownProduction;
      item.totalAvailable = item.purchased + item.ownProduction;
      item.remaining = item.totalAvailable - item.packedQuantity;
      setInventory(updated);
    } else {
      // Add new
      const totalAvailable = purchased + ownProduction;
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substring(7),
        variety,
        purchased,
        ownProduction,
        packedQuantity: 0,
        totalAvailable,
        remaining: totalAvailable,
        date: new Date().toISOString(),
      };
      setInventory([newItem, ...inventory]);
    }
  };

  // Calculate totals for the summary cards
  const totals = inventory.reduce(
    (acc, curr) => {
      acc.purchased += curr.purchased;
      acc.ownProduction += curr.ownProduction;
      acc.totalAvailable += curr.totalAvailable;
      acc.packedQuantity += curr.packedQuantity;
      acc.remaining += curr.remaining;
      return acc;
    },
    { purchased: 0, ownProduction: 0, totalAvailable: 0, packedQuantity: 0, remaining: 0 }
  );

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Inventory Overview</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Monitor your daily purchased stock, own production, and total availability.
        </p>
      </div>

      <InventoryCards 
        purchased={totals.purchased}
        ownProduction={totals.ownProduction}
        totalAvailable={totals.totalAvailable}
        packedQuantity={totals.packedQuantity}
        remaining={totals.remaining}
      />

      <div className="grid gap-8 md:grid-cols-7 lg:grid-cols-3">
        <div className="md:col-span-3 lg:col-span-1">
          <StockEntryForm onAddStock={handleAddStock} />
        </div>
        
        <Card className="md:col-span-4 lg:col-span-2 shadow-md border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
            <CardTitle>Recent Inventory Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead className="text-right">Purchased</TableHead>
                  <TableHead className="text-right">Own Prod.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Packed</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell className="font-medium text-slate-600 dark:text-slate-300">
                      {formatDate(item.date)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-300">
                        {item.variety}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-blue-600 dark:text-blue-400">{item.purchased} kg</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{item.ownProduction} kg</TableCell>
                    <TableCell className="text-right font-bold text-purple-600 dark:text-purple-400">{item.totalAvailable} kg</TableCell>
                    <TableCell className="text-right text-amber-600 dark:text-amber-400">{item.packedQuantity} kg</TableCell>
                    <TableCell className="text-right font-medium text-rose-600 dark:text-rose-400">{item.remaining} kg</TableCell>
                  </TableRow>
                ))}
                {inventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                      No inventory logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
