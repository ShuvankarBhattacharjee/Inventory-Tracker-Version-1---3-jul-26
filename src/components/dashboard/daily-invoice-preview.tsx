"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { Printer } from "lucide-react";

interface DailyInvoicePreviewProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  date?: string;
}

export function DailyInvoicePreview({ orders, isOpen, onClose, date }: DailyInvoicePreviewProps) {
  if (!isOpen) return null;

  const invoiceDate = date ? new Date(date) : new Date();

  // Generate a daily invoice number
  const invoiceNumber = `DAILY-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}${String(invoiceDate.getDate()).padStart(2, '0')}`;
  
  const grandTotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:w-full print:max-w-none print:shadow-none print:m-0 print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-xl">Daily Summary Invoice</DialogTitle>
        </DialogHeader>

        {/* Invoice Body */}
        <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-lg mt-4 bg-white dark:bg-slate-950" id="daily-invoice-printable">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6 mb-6 gap-6 sm:gap-0">
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
            <div className="text-left sm:text-right">
              <h2 className="text-2xl font-light text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-2">Daily Summary</h2>
              <p className="text-sm font-medium">Ref No: <span className="text-slate-500">{invoiceNumber}</span></p>
              <p className="text-sm font-medium">Date: <span className="text-slate-500">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(invoiceDate)}</span></p>
            </div>
          </div>

          {/* Line Items */}
          <div className="overflow-x-auto w-full mb-8">
            <table className="w-full min-w-[650px]">
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
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">No orders placed today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
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

        <DialogFooter className="print:hidden mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={orders.length === 0}>
            <Printer className="w-4 h-4 mr-2" />
            Print Daily Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
