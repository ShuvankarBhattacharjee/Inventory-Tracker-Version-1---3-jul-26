"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer, AlertCircle } from "lucide-react";

function InvoiceContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        const parsedOrders = JSON.parse(dataParam);
        setOrders(parsedOrders);
      }
    } catch (e) {
      console.error("Failed to parse invoice data from URL", e);
      setError(true);
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h1 className="text-xl font-bold">Failed to load invoice</h1>
        <p>The link might be broken or the data is invalid.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading invoice data...</p>
      </div>
    );
  }

  const invoiceNumber = `DAILY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`;
  const grandTotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4 print:hidden">
          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="w-4 h-4 mr-2" />
            Print Daily Invoice
          </Button>
        </div>

        {/* Invoice Body */}
        <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 shadow-sm print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="/logo.png" alt="SS OM Bharat Logo" className="h-16 w-auto object-contain" />
                <h1 className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-500">
                  SS OM Bharat
                </h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Premium Mushroom Cultivators</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">contact@ssombharat.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-light text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-2">Daily Summary</h2>
              <p className="text-sm font-medium">Ref No: <span className="text-slate-500">{invoiceNumber}</span></p>
              <p className="text-sm font-medium">Date: <span className="text-slate-500">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date())}</span></p>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 font-semibold text-sm">Customer</th>
                <th className="text-left py-3 font-semibold text-sm">Product</th>
                <th className="text-center py-3 font-semibold text-sm">Packs</th>
                <th className="text-center py-3 font-semibold text-sm">Qty/Pack</th>
                <th className="text-center py-3 font-semibold text-sm">Total Qty</th>
                <th className="text-right py-3 font-semibold text-sm">Price/Pack</th>
                <th className="text-right py-3 font-semibold text-sm">Amount</th>
                <th className="text-center py-3 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id} className={`border-b border-slate-100 dark:border-slate-800/50 ${idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
                  <td className="py-3 font-medium">{order.customerName}</td>
                  <td className="py-3">{order.product}</td>
                  <td className="text-center py-3">{order.itemsOrPackets}</td>
                  <td className="text-center py-3">{order.quantity} {order.unit}</td>
                  <td className="text-center py-3">{order.totalQuantityKg} kg</td>
                  <td className="text-right py-3">₹{order.pricePerPack.toLocaleString('en-IN')}</td>
                  <td className="text-right py-3 font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="text-center py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === 'Packed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2 md:w-1/3">
              <div className="flex justify-between py-3 border-t-2 border-emerald-600 dark:border-emerald-500 mt-2">
                <span className="font-bold text-lg">Daily Grand Total</span>
                <span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-4">
            End of Day Summary for SS OM Bharat
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Invoice...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
