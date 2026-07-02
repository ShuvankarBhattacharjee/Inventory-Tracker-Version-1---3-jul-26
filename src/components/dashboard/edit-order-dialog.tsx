"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, Order } from "@/types";
import { toast } from "sonner";

interface EditOrderDialogProps {
  order: Order | null;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order, oldQuantityKg: number) => boolean;
}

export function EditOrderDialog({ order, products, isOpen, onClose, onSave }: EditOrderDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"KG" | "GM">("KG");
  const [pricePerPack, setPricePerPack] = useState("");
  const [itemsOrPackets, setItemsOrPackets] = useState("");
  
  useEffect(() => {
    if (order) {
      setQuantity(order.quantity.toString());
      setUnit(order.unit);
      setPricePerPack(order.pricePerPack.toString());
      setItemsOrPackets(order.itemsOrPackets.toString());
    }
  }, [order]);

  if (!order) return null;

  // Available stock for selected product (adding back the current order's quantity)
  const selectedProduct = products.find(p => p.variety === order.product);
  const availableStock = (selectedProduct?.availableQuantity || 0) + order.totalQuantityKg;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const qtyInKg = unit === "GM" ? qtyPerPack / 1000 : qtyPerPack;
    const totalQuantityKg = qtyInKg * packs;
    
    if (totalQuantityKg > availableStock) {
      toast.error(`Insufficient stock! You need ${totalQuantityKg}kg but only ${availableStock}kg is available.`);
      return;
    }

    const updatedOrder: Order = {
      ...order,
      quantity: qtyPerPack,
      unit,
      pricePerPack: parseFloat(pricePerPack) || 0,
      itemsOrPackets: packs,
      totalQuantityKg,
      totalAmount: packs * (parseFloat(pricePerPack) || 0)
    };

    const success = onSave(updatedOrder, order.totalQuantityKg);
    if (success) {
      toast.success("Order updated successfully!");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle>Edit Order: {order.customerName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <Input value={order.product} disabled className="bg-slate-50" />
            <p className="text-xs text-slate-500">Available Stock: {availableStock}kg (including this order)</p>
          </div>

          <div className="space-y-2">
            <Label>Quantity per Pack</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price per Pack (₹)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={pricePerPack}
                onChange={(e) => setPricePerPack(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Total Packs</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={itemsOrPackets}
                onChange={(e) => setItemsOrPackets(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
