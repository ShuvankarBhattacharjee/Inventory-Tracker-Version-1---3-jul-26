"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";

export interface HistoryRecord {
  date: string;
  totalAmount: number;
  totalPayment?: number;
  totalQuantityKg: number;
  orderCount: number;
  details: string;
  invoiceLink: string;
}

interface HistoryListProps {
  onViewInvoice: (orders: Order[], date: string) => void;
}

export function HistoryList({ onViewInvoice }: HistoryListProps) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note: Replace this URL with your newly deployed Google Apps Script Web App URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz9LVCcHy7O7j-LHGE3LL_-DWOWwbmXq0iyB6gIbvYweL3N_kAaGlZBjKPwkU0LBvZ4ng/exec";

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // In Google Apps Script, we need to handle CORS. But since we might be using the old script 
      // which we can't control yet, if it throws an error we show a helpful message.
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setRecords(data || []);
    } catch (err: any) {
      console.error("Fetch history error:", err);
      // We set a fallback empty array if the script isn't updated yet.
      setError("Could not load history. Please ensure the Google Apps Script is updated as per the implementation plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewInvoice = (record: HistoryRecord) => {
    try {
      // Extract data parameter from the URL
      const url = new URL(record.invoiceLink);
      const dataParam = url.searchParams.get("data");
      
      if (!dataParam) {
        toast.error("No detailed order data found in this record.");
        return;
      }
      
      const parsedOrders = JSON.parse(decodeURIComponent(dataParam)) as Order[];
      onViewInvoice(parsedOrders, record.date);
    } catch (error) {
      console.error("Failed to parse invoice link:", error);
      toast.error("Failed to parse the invoice details.");
    }
  };

  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Past 15 Days History
          </CardTitle>
          <CardDescription>
            Recent data fetched from Google Sheets.
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchHistory}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Refresh Data"}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
              <p>Fetching history from Google Sheets...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 text-red-500 p-6 text-center">
              <p className="mb-2 font-semibold">Failed to load data</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500">
              <p>No historical data found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Qty (KG)</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => {
                  let dateStr = record.date;
                  if (typeof record.date === 'string') {
                    if (record.date.includes('T')) {
                      const d = new Date(record.date);
                      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    } else {
                      // If it's something like DD/MM/YYYY just show it
                      dateStr = record.date.split('T')[0];
                    }
                  }
                  
                  return (
                    <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer" onClick={() => handleViewInvoice(record)}>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                        {dateStr}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{record.orderCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {record.totalQuantityKg} kg
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
                        ₹{Number(record.totalAmount).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-slate-500 truncate max-w-xs" title={record.details}>
                        {record.details}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                          title="View Details & Download Invoice"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(record);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
