"use client";

import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ListOrdered, Edit2, Trash2, RefreshCw } from "lucide-react";

interface OrderListProps {
  orders: Order[];
  onToggleStatus: (orderId: string, isPacked: boolean) => void;
  onGenerateInvoice: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onGenerateDailyInvoice: () => void;
  isSyncing?: boolean;
  onSync?: () => void;
}

export function OrderList({ orders, onToggleStatus, onGenerateInvoice, onEditOrder, onDeleteOrder, onGenerateDailyInvoice, isSyncing, onSync }: OrderListProps) {
  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-emerald-600" />
            Today's Orders
          </CardTitle>
          <CardDescription>
            Manage and generate invoices for today's sales.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGenerateDailyInvoice}
            className="flex text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            disabled={orders.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Daily Summary
          </Button>
          
          {orders.length > 0 && onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={isSyncing}
              className="flex text-blue-700 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync to Sheets'}
            </Button>
          )}
          
          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 ml-auto sm:ml-0">
            {orders.length} Order{orders.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty/Pack</TableHead>
              <TableHead className="text-center">Packs</TableHead>
              <TableHead className="text-right">Total Qty</TableHead>
              <TableHead className="text-right">Price/Pack</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                <TableCell>
                  <Checkbox 
                    checked={order.status === "Packed"}
                    onCheckedChange={(checked) => onToggleStatus(order.id, checked as boolean)}
                    aria-label="Mark as packed"
                  />
                </TableCell>
                <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                  {order.customerName}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {order.product}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-slate-600 dark:text-slate-400">
                  {order.quantity} {order.unit}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {order.itemsOrPackets}
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                  {order.totalQuantityKg} kg
                </TableCell>
                <TableCell className="text-right text-slate-600 dark:text-slate-400">
                  ₹{order.pricePerPack}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <Badge className={order.status === "Packed" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onGenerateInvoice(order)}
                      className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      title="Generate Invoice"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEditOrder(order)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      title="Edit Order"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if(confirm('Are you sure you want to delete this order? Stock will be restored.')) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Delete Order"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-slate-500">
                  No orders placed today.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
