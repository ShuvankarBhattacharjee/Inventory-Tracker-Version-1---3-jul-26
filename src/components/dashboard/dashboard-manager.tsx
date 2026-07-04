"use client";

import { useState, useEffect, useRef } from "react";
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
  const getLocalToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const loadedDates = useRef<Set<string>>(new Set());

  const isPastDate = selectedDate < getLocalToday();

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz9LVCcHy7O7j-LHGE3LL_-DWOWwbmXq0iyB6gIbvYweL3N_kAaGlZBjKPwkU0LBvZ4ng/exec";

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

  // Fetch orders when selectedDate changes
  useEffect(() => {
    const fetchOrders = async () => {
      // If we already loaded this date, or if it's the very first load and we don't have a URL to fetch from, skip
      if (loadedDates.current.has(selectedDate)) return;
      
      setIsFetchingOrders(true);
      try {
        const response = await fetch(`${SCRIPT_URL}?date=${selectedDate}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        if (data && !data.error && Array.isArray(data) && data.length > 0) {
          // Add these orders to the local state
          setOrders(prev => {
            // Remove any existing orders for this date to avoid duplicates
            const otherOrders = prev.filter(o => o.date.split('T')[0] !== selectedDate);
            return [...otherOrders, ...data];
          });
        }
        loadedDates.current.add(selectedDate);
      } catch (err) {
        console.error("Error fetching detailed orders:", err);
        // We still mark as loaded so we don't endlessly retry if there's no data
        loadedDates.current.add(selectedDate);
      } finally {
        setIsFetchingOrders(false);
      }
    };
    
    fetchOrders();
  }, [selectedDate]);

  // Dynamically calculate available stock based on all loaded orders
  const displayProducts = products.map(p => {
    const usedQuantity = orders
      .filter(o => o.product === p.variety)
      .reduce((sum, o) => sum + o.totalQuantityKg, 0);
    return {
      ...p,
      availableQuantity: p.initialQuantity - usedQuantity
    };
  });

  // Handlers
  const handleAddStock = (variety: MushroomVariety, quantity: number) => {
    setProducts((prev) => {
      const existing = prev.find(p => p.variety === variety);
      if (existing) {
        return prev.map(p => 
          p.variety === variety 
            ? { 
                ...p, 
                initialQuantity: p.initialQuantity + quantity 
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
    
    const usedQuantity = orders
      .filter(o => o.product === product.variety)
      .reduce((sum, o) => sum + o.totalQuantityKg, 0);
      
    const newAvailable = newInitialQuantity - usedQuantity;
    
    if (newAvailable < 0) {
      toast.error(`Cannot reduce stock to ${newInitialQuantity}kg because ${usedQuantity.toFixed(2)}kg have already been sold/allocated.`);
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
    const product = displayProducts.find(p => p.variety === orderData.product);
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

    // Add order (availableQuantity is now calculated dynamically)
    setOrders((prev) => [newOrder, ...prev]);
    
    // Automatically switch the view to the date of the order just placed
    setSelectedDate((date || new Date().toISOString()).split('T')[0]);
    
    return true;
  };
  
  const handleEditOrderSave = (updatedOrder: Order, oldQuantityKg: number) => {
    const diff = updatedOrder.totalQuantityKg - oldQuantityKg;
    const product = displayProducts.find(p => p.variety === updatedOrder.product);
    if (diff > 0 && (!product || product.availableQuantity < diff)) {
      return false; // Shouldn't happen due to validation, but safe
    }
    
    const newOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    setOrders(newOrders);
    
    // Auto sync after saving edits
    handleSyncToGoogleSheets(newOrders);
    
    return true;
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;

    // Remove order (stock is added back dynamically)
    const newOrders = orders.filter(o => o.id !== orderId);
    setOrders(newOrders);
    handleSyncToGoogleSheets(newOrders);
  };

  const handleToggleOrderStatus = (orderId: string, isPacked: boolean) => {
    const newOrders = orders.map(o => 
      o.id === orderId 
        ? { ...o, status: isPacked ? "Packed" : "Pending" } 
        : o
    );
    setOrders(newOrders);
    handleSyncToGoogleSheets(newOrders);
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

  const handleSyncToGoogleSheets = async (ordersOverride?: Order[]) => {
    const ordersToSync = (ordersOverride || orders).filter(o => o.date.split('T')[0] === selectedDate);
    // Allow syncing even if 0 orders so users can clear a day in the sheets
    
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

      const payload = {
        date: selectedDate,
        totalAmount,
        totalQuantityKg,
        orderCount: ordersToSync.length,
        details,
        invoiceLink,
        orders: ordersToSync
      };

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
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
          products={displayProducts} 
          onAddStock={handleAddStock} 
          onEditStock={handleEditStock}
          onDeleteStock={handleDeleteStock}
        />
      </section>

      {/* 2 & 3. Order Form and Order List */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-6">
          <OrderForm products={displayProducts} onAddOrder={handleAddOrder} />
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
            onSync={() => handleSyncToGoogleSheets()}
            isFetching={isFetchingOrders}
            isPastDate={isPastDate}
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
        products={displayProducts}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleEditOrderSave}
      />
    </div>
  );
}
