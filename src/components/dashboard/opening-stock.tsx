"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, MushroomVariety } from "@/types";
import { PlusCircle, Package, Edit2, Trash2 } from "lucide-react";

interface OpeningStockProps {
  products: Product[];
  onAddStock: (variety: MushroomVariety, quantity: number) => void;
  onEditStock: (productId: string, newInitialQuantity: number) => void;
  onDeleteStock: (productId: string) => void;
}

export function OpeningStock({ products, onAddStock, onEditStock, onDeleteStock }: OpeningStockProps) {
  const [variety, setVariety] = useState<MushroomVariety>("Oyster");
  const [customVariety, setCustomVariety] = useState("");
  const [quantity, setQuantity] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 0;
    if (qty <= 0) return;

    const finalVariety = variety === "Other" && customVariety ? customVariety : variety;
    onAddStock(finalVariety, qty);
    setQuantity("0");
    setCustomVariety("");
  };

  const handleEditClick = (product: Product) => {
    const currentTotal = product.initialQuantity || product.availableQuantity || 0;
    const newQtyStr = window.prompt(`Enter new total opening stock for ${product.variety} (KG):`, currentTotal.toString());
    if (newQtyStr !== null) {
      const newQty = parseFloat(newQtyStr);
      if (!isNaN(newQty) && newQty > 0) {
        onEditStock(product.id, newQty);
      }
    }
  };

  const handleDeleteClick = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete the stock record for ${product.variety}?`)) {
      onDeleteStock(product.id);
    }
  };

  return (
    <Card className="shadow-md border-emerald-100 dark:border-emerald-900 overflow-hidden">
      <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900">
        <CardTitle className="text-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
          <Package className="h-5 w-5" />
          Today's Opening Stock
        </CardTitle>
        <CardDescription>
          Enter the starting quantities for today's sales.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="space-y-2 w-full md:w-1/3">
            <Label htmlFor="variety">Product Type</Label>
            <Select 
              value={variety} 
              onValueChange={(val) => setVariety(val as MushroomVariety)}
            >
              <SelectTrigger id="variety" className="bg-white dark:bg-slate-950 border-slate-200">
                <SelectValue placeholder="Select variety" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Button">Button Mushroom</SelectItem>
                <SelectItem value="Oyster">Oyster Mushroom</SelectItem>
                <SelectItem value="Milky">Milky Mushroom</SelectItem>
                <SelectItem value="Cremini">Cremini Mushroom</SelectItem>
                <SelectItem value="Portobello">Portobello Mushroom</SelectItem>
                <SelectItem value="Other">Add New Product...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {variety === "Other" && (
            <div className="space-y-2 w-full md:w-1/4 animate-in fade-in zoom-in duration-300">
              <Label htmlFor="customVariety">New Product Name</Label>
              <Input
                id="customVariety"
                value={customVariety}
                onChange={(e) => setCustomVariety(e.target.value)}
                placeholder="e.g. Enoki"
                required
              />
            </div>
          )}
          
          <div className="space-y-2 w-full md:w-1/4">
            <Label htmlFor="quantity">Opening Quantity (KG)</Label>
            <Input
              id="quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-mono bg-white dark:bg-slate-950 border-slate-200"
              required
            />
          </div>
          
          <Button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </form>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => {
            const initial = product.initialQuantity || product.availableQuantity || 1;
            const percentage = Math.max(0, Math.min(100, (product.availableQuantity / initial) * 100));
            const isLow = percentage <= 20;
            const isMedium = percentage > 20 && percentage <= 50;
            
            return (
              <div key={product.id} className="group relative rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex flex-col transition-all hover:shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => handleEditClick(product)} className="p-1 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 rounded shadow-sm" title="Edit Stock">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteClick(product)} className="p-1 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-800 rounded shadow-sm" title="Delete Stock">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex justify-between items-end mb-3 mt-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{product.variety}</span>
                  <span className={`text-lg font-bold ${isLow ? 'text-red-600 dark:text-red-500' : isMedium ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {product.availableQuantity.toFixed(2)} <span className="text-xs font-normal opacity-70">kg left</span>
                  </span>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-1.5 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>{percentage.toFixed(0)}% remaining</span>
                  <span>Total: {initial.toFixed(2)} kg</span>
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 italic">
              No products in stock yet. Add opening stock above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
