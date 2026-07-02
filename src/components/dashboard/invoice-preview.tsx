"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

interface InvoicePreviewProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
}

export function InvoicePreview({ order, isOpen, onClose, onSave }: InvoicePreviewProps) {
  if (!order) return null;

  // Generate a random invoice number for display
  const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${order.id.substring(0, 4).toUpperCase()}`;

  const handleSave = () => {
    onSave(order);
    toast.success(`Invoice ${invoiceNumber} saved successfully`);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:w-full print:max-w-none print:shadow-none print:m-0 print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-xl">Invoice Preview</DialogTitle>
        </DialogHeader>

        {/* Invoice Body */}
        <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-lg mt-4 bg-white dark:bg-slate-950" id="invoice-printable">
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
              <h2 className="text-3xl font-light text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-2">Invoice</h2>
              <p className="text-sm font-medium">Invoice No: <span className="text-slate-500">{invoiceNumber}</span></p>
              <p className="text-sm font-medium">Date: <span className="text-slate-500">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(order.date))}</span></p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="text-lg font-semibold">{order.customerName}</p>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 font-semibold text-sm">Product Description</th>
                <th className="text-center py-3 font-semibold text-sm">Packs/Items</th>
                <th className="text-center py-3 font-semibold text-sm">Qty/Pack</th>
                <th className="text-center py-3 font-semibold text-sm">Total Qty</th>
                <th className="text-right py-3 font-semibold text-sm">Price/Pack</th>
                <th className="text-right py-3 font-semibold text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800/50">
                <td className="py-4">
                  <p className="font-medium">{order.product} Mushroom</p>
                  <p className="text-xs text-slate-500">
                    Status: <span className={order.status === 'Packed' ? 'text-emerald-600' : 'text-amber-600'}>{order.status}</span>
                  </p>
                </td>
                <td className="text-center py-4">{order.itemsOrPackets}</td>
                <td className="text-center py-4">{order.quantity} {order.unit}</td>
                <td className="text-center py-4 font-medium">{order.totalQuantityKg} KG</td>
                <td className="text-right py-4">₹{order.pricePerPack.toLocaleString('en-IN')}</td>
                <td className="text-right py-4 font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2 md:w-1/3">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-sm text-slate-500">Subtotal</span>
                <span className="font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-sm text-slate-500">Tax (0%)</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-emerald-600 dark:border-emerald-500 mt-2">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-4">
            Thank you for your business with SS OM Bharat!
          </div>
        </div>

        <DialogFooter className="print:hidden mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Save & Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
