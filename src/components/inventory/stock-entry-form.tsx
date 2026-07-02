"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MushroomVariety } from "@/types/inventory";
import { PlusCircle } from "lucide-react";

interface StockEntryFormProps {
  onAddStock: (variety: MushroomVariety, purchased: number, ownProduction: number) => void;
}

export function StockEntryForm({ onAddStock }: StockEntryFormProps) {
  const [variety, setVariety] = useState<MushroomVariety>("Button");
  const [purchased, setPurchased] = useState<string>("0");
  const [ownProduction, setOwnProduction] = useState<string>("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const purchasedNum = parseFloat(purchased) || 0;
    const ownProdNum = parseFloat(ownProduction) || 0;
    
    if (purchasedNum === 0 && ownProdNum === 0) return;
    
    onAddStock(variety, purchasedNum, ownProdNum);
    
    // Reset form mostly, keep variety
    setPurchased("0");
    setOwnProduction("0");
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
        <CardTitle className="text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-indigo-500" />
          Opening Stock Entry
        </CardTitle>
        <CardDescription>
          Record daily purchased stock and own farm production.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="variety">Mushroom Variety</Label>
              <Select 
                value={variety} 
                onValueChange={(val) => setVariety(val as MushroomVariety)}
              >
                <SelectTrigger id="variety" className="bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Select variety" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Button">Button Mushroom</SelectItem>
                  <SelectItem value="Oyster">Oyster Mushroom</SelectItem>
                  <SelectItem value="Milky">Milky Mushroom</SelectItem>
                  <SelectItem value="Cremini">Cremini Mushroom</SelectItem>
                  <SelectItem value="Portobello">Portobello Mushroom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purchased">Purchased Stock (kg)</Label>
              <Input
                id="purchased"
                type="number"
                min="0"
                step="0.5"
                value={purchased}
                onChange={(e) => setPurchased(e.target.value)}
                className="bg-white dark:bg-slate-950 font-mono"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownProduction">Own Production (kg)</Label>
              <Input
                id="ownProduction"
                type="number"
                min="0"
                step="0.5"
                value={ownProduction}
                onChange={(e) => setOwnProduction(e.target.value)}
                className="bg-white dark:bg-slate-950 font-mono"
                placeholder="0"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product Stock
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
