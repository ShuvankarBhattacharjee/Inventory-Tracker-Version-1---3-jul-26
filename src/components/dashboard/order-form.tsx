"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, MushroomVariety, Order } from "@/types";
import { ShoppingCart, Calculator } from "lucide-react";
import { toast } from "sonner";

interface OrderFormProps {
  products: Product[];
  onAddOrder: (orderData: Omit<Order, "id" | "status" | "date">) => boolean;
}

export function OrderForm({ products, onAddOrder }: OrderFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [product, setProduct] = useState<MushroomVariety | "">("Oyster");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"KG" | "GM">("KG");
  const [pricePerPack, setPricePerPack] = useState("");
  const [itemsOrPackets, setItemsOrPackets] = useState("1");
  
  // Auto-calculated total
  const [totalQuantityKg, setTotalQuantityKg] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Available stock for selected product
  const selectedProduct = products.find(p => p.variety === product);
  const availableStock = selectedProduct?.availableQuantity || 0;

  useEffect(() => {
    const qtyPerPack = parseFloat(quantity) || 0;
    const packs = parseInt(itemsOrPackets) || 1;
    const price = parseFloat(pricePerPack) || 0;
    
    // Normalize to KG for total quantity calculation
    const qtyInKg = unit === "GM" ? qtyPerPack / 1000 : qtyPerPack;
    const calculatedTotalQtyKg = qtyInKg * packs;
    
    setTotalQuantityKg(calculatedTotalQtyKg);
    setTotalAmount(packs * price);
  }, [quantity, unit, pricePerPack, itemsOrPackets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) {
      toast.error("Please select a product");
      return;
    }
    
    const qtyPerPack = parseFloat(quantity) || 0;
    const packs = parseInt(itemsOrPackets) || 1;
    
    if (qtyPerPack <= 0) {
      toast.error("Quantity per pack must be greater than zero");
      return;
    }
    
    if (packs <= 0) {
      toast.error("Number of packs must be at least 1");
      return;
    }
    
    if (totalQuantityKg > availableStock) {
      toast.error(`Insufficient stock! You need ${totalQuantityKg}kg but only ${availableStock}kg is available.`);
      return;
    }

    const success = onAddOrder({
      customerName,
      product,
      quantity: qtyPerPack,
      unit,
      pricePerPack: parseFloat(pricePerPack) || 0,
      itemsOrPackets: packs,
      totalQuantityKg,
      totalAmount
    });

    if (success) {
      toast.success("Order added successfully!");
      // Reset form
      setCustomerName("");
      setQuantity("");
      setPricePerPack("");
      setItemsOrPackets("1");
      // Keep unit as is for convenience
    }
  };

  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-800 h-full">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-xl flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-emerald-600" />
          Add New Order
        </CardTitle>
        <CardDescription>
          Create a new customer order. Stock will be deducted automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer / Buyer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. FreshMart Supermarket"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderProduct">Product Type</Label>
              <Select 
                value={product} 
                onValueChange={(val) => setProduct(val as MushroomVariety)}
                required
              >
                <SelectTrigger id="orderProduct">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.variety}>
                      {p.variety} ({p.availableQuantity}kg available)
                    </SelectItem>
                  ))}
                  {products.length === 0 && (
                    <SelectItem value="none" disabled>No products in stock</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="orderQuantity">Quantity per Pack</Label>
                {product && (
                  <span className="text-xs text-emerald-600 font-medium">
                    Available: {availableStock}kg
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  id="orderQuantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 250"
                  className="flex-1"
                  required
                />
                <Select value={unit} onValueChange={(val: "KG" | "GM") => setUnit(val)}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="GM">GM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerPack">Price per Pack (₹)</Label>
              <Input
                id="pricePerPack"
                type="number"
                min="0"
                step="1"
                value={pricePerPack}
                onChange={(e) => setPricePerPack(e.target.value)}
                placeholder="e.g. 50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemsOrPackets">Total Packs/Items</Label>
              <Input
                id="itemsOrPackets"
                type="number"
                min="1"
                step="1"
                value={itemsOrPackets}
                onChange={(e) => setItemsOrPackets(e.target.value)}
                placeholder="e.g. 10"
                required
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span>Total Quantity (Deducted):</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{totalQuantityKg} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                <Calculator className="h-4 w-4" />
                Total Amount:
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4" disabled={products.length === 0}>
            Place Order
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
