"use client";

import { useState, useEffect } from "react";
import { OpeningStock } from "./opening-stock";
import { OrderForm } from "./order-form";
import { OrderList } from "./order-list";
import { InvoicePreview } from "./invoice-preview";
import { DailyInvoicePreview } from "./daily-invoice-preview";
import { EditOrderDialog } from "./edit-order-dialog";
import { HistoryList } from "./history-list";
import { Product, Order, MushroomVariety, Invoice } from "@/types";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export function DashboardManager() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Dialog state
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showDailyInvoice, setShowDailyInvoice] = useState(false);
  const [historicalInvoiceData, setHistoricalInvoiceData] = useState<{orders: Order[], date: string} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Prevent accidental refresh/leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show warning if there are any products or orders
      if (products.length > 0 || orders.length > 0) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = ''; 
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [products.length, orders.length]);

  // Handlers
  const handleAddStock = (variety: MushroomVariety, quantity: number) => {
    setProducts((prev) => {
      const existing = prev.find(p => p.variety === variety);
      if (existing) {
        return prev.map(p => 
          p.variety === variety 
            ? { 
                ...p, 
                availableQuantity: p.availableQuantity + quantity,
                initialQuantity: (p.initialQuantity || 0) + quantity 
              } 
            : p
        );
      }
      return [
        ...prev,
        { id: crypto.randomUUID(), variety, availableQuantity: quantity, initialQuantity: quantity }
      ];
    });
  };

  const handleEditStock = (productId: string, newInitialQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const soldQuantity = (product.initialQuantity || product.availableQuantity) - product.availableQuantity;
    const newAvailable = newInitialQuantity - soldQuantity;
    
    if (newAvailable < 0) {
      toast.error(`Cannot reduce stock to ${newInitialQuantity}kg because ${soldQuantity.toFixed(2)}kg have already been sold.`);
      return;
    }
    
    setProducts((prev) => prev.map(p => 
      p.id === productId 
        ? { ...p, initialQuantity: newInitialQuantity, availableQuantity: newAvailable }
        : p
    ));
  };

  const handleDeleteStock = (productId: string) => {
    setProducts((prev) => prev.filter(p => p.id !== productId));
  };

  const handleAddOrder = (orderData: Omit<Order, "id" | "status" | "date"> & { date?: string }) => {
    const product = products.find(p => p.variety === orderData.product);
    if (!product || product.availableQuantity < orderData.totalQuantityKg) {
      return false;
    }

    const { date, ...restData } = orderData;
    const newOrder: Order = {
      ...restData,
      id: crypto.randomUUID(),
      status: "Pending",
      date: date || new Date().toISOString()
    };

    // Deduct stock
    setProducts((prev) => 
      prev.map(p => 
        p.variety === orderData.product 
          ? { ...p, availableQuantity: p.availableQuantity - orderData.totalQuantityKg }
          : p
      )
    );

    // Add order
    setOrders((prev) => [newOrder, ...prev]);
    
    // Automatically switch the view to the date of the order just placed
    setSelectedDate((date || new Date().toISOString()).split('T')[0]);
    
    return true;
  };
  
  const handleEditOrderSave = (updatedOrder: Order, oldQuantityKg: number) => {
    // Add old stock back, deduct new stock
    const diff = updatedOrder.totalQuantityKg - oldQuantityKg;
    
    const product = products.find(p => p.variety === updatedOrder.product);
    if (diff > 0 && (!product || product.availableQuantity < diff)) {
      return false; // Shouldn't happen due to validation, but safe
    }
    
    setProducts((prev) => 
      prev.map(p => 
        p.variety === updatedOrder.product 
          ? { ...p, availableQuantity: p.availableQuantity - diff }
          : p
      )
    );

    setOrders((prev) => 
      prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
    );
    
    return true;
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;

    // Add stock back
    setProducts((prev) => 
      prev.map(p => 
        p.variety === orderToDelete.product 
          ? { ...p, availableQuantity: p.availableQuantity + orderToDelete.totalQuantityKg }
          : p
      )
    );

    // Remove order
    setOrders((prev) => prev.filter(o => o.id !== orderId));
  };

  const handleToggleOrderStatus = (orderId: string, isPacked: boolean) => {
    setOrders((prev) => 
      prev.map(o => 
        o.id === orderId 
          ? { ...o, status: isPacked ? "Packed" : "Pending" } 
          : o
      )
    );
  };

  const handleSaveInvoice = (order: Order) => {
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${order.id.substring(0, 4).toUpperCase()}`,
      orderReference: order.id,
      date: new Date().toISOString(),
      grandTotal: order.totalAmount
    };
    
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleSyncToGoogleSheets = async () => {
    const ordersToSync = orders.filter(o => o.date.split('T')[0] === selectedDate);
    if (ordersToSync.length === 0) return;
    
    setIsSyncing(true);
    try {
      const totalAmount = ordersToSync.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalQuantityKg = ordersToSync.reduce((sum, order) => sum + order.totalQuantityKg, 0);
      
      // Build a detailed summary
      const details = ordersToSync.map(o => 
        `${o.customerName}: ${o.product} (${o.totalQuantityKg}kg) - ₹${o.totalAmount}`
      ).join(' | ');

      // Generate a link to view the invoice using the current domain (so it works when hosted)
      const encodedData = encodeURIComponent(JSON.stringify(ordersToSync));
      const invoiceLink = `${window.location.origin}/daily-invoice?data=${encodedData}`;

      const payload = new URLSearchParams();
      payload.append('date', selectedDate);
      payload.append('totalAmount', totalAmount.toString());
      payload.append('totalQuantityKg', totalQuantityKg.toString());
      payload.append('orderCount', orders.length.toString());
      payload.append('details', details);
      payload.append('invoiceLink', invoiceLink);

      const response = await fetch('https://script.google.com/macros/s/AKfycbz9LVCcHy7O7j-LHGE3LL_-DWOWwbmXq0iyB6gIbvYweL3N_kAaGlZBjKPwkU0LBvZ4ng/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString()
      });

      // no-cors means we won't be able to read response status, so we assume success if no throw
      toast.success('Successfully synced to Google Sheets!');
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync data to Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <Toaster position="top-right" richColors />
      
      {/* 1. Opening Stock Section */}
      <section>
        <OpeningStock 
          products={products} 
          onAddStock={handleAddStock} 
          onEditStock={handleEditStock}
          onDeleteStock={handleDeleteStock}
        />
      </section>

      {/* 2 & 3. Order Form and Order List */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-6">
          <OrderForm products={products} onAddOrder={handleAddOrder} />
        </div>
        
        <div className="lg:col-span-2">
          <OrderList 
            orders={orders.filter(o => o.date.split('T')[0] === selectedDate)} 
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onToggleStatus={handleToggleOrderStatus} 
            onGenerateInvoice={(order) => setPreviewOrder(order)} 
            onEditOrder={(order) => setEditingOrder(order)}
            onDeleteOrder={handleDeleteOrder}
            onGenerateDailyInvoice={() => setShowDailyInvoice(true)}
            isSyncing={isSyncing}
            onSync={handleSyncToGoogleSheets}
          />
        </div>
      </section>

      {/* History Section */}
      <section className="mt-8">
        <HistoryList onViewInvoice={(orders, date) => setHistoricalInvoiceData({orders, date})} />
      </section>

      {/* 4. Invoice Modal */}
      <InvoicePreview 
        order={previewOrder} 
        isOpen={!!previewOrder} 
        onClose={() => setPreviewOrder(null)} 
        onSave={handleSaveInvoice}
      />
      
      <DailyInvoicePreview
        orders={orders.filter(o => o.date.split('T')[0] === selectedDate)}
        date={selectedDate}
        isOpen={showDailyInvoice}
        onClose={() => setShowDailyInvoice(false)}
      />

      <DailyInvoicePreview
        orders={historicalInvoiceData?.orders || []}
        date={historicalInvoiceData?.date}
        isOpen={!!historicalInvoiceData}
        onClose={() => setHistoricalInvoiceData(null)}
      />

      <EditOrderDialog
        order={editingOrder}
        products={products}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleEditOrderSave}
      />
    </div>
  );
}
