import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Boxes, ShoppingCart, ArchiveRestore } from "lucide-react";

interface InventoryCardsProps {
  purchased: number;
  ownProduction: number;
  totalAvailable: number;
  packedQuantity: number;
  remaining: number;
}

export function InventoryCards({
  purchased,
  ownProduction,
  totalAvailable,
  packedQuantity,
  remaining,
}: InventoryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Purchased Stock
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{purchased.toLocaleString()} kg</div>
          <p className="text-xs text-blue-600 dark:text-blue-400 opacity-80 mt-1">
            From market & suppliers
          </p>
        </CardContent>
      </Card>

      <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Own Production
          </CardTitle>
          <ArchiveRestore className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{ownProduction.toLocaleString()} kg</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 opacity-80 mt-1">
            Farm harvested
          </p>
        </CardContent>
      </Card>

      <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 shadow-sm transition-all hover:shadow-md scale-105 z-10 relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
            Total Available
          </CardTitle>
          <Boxes className="h-5 w-5 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-purple-900 dark:text-purple-100">{totalAvailable.toLocaleString()} kg</div>
          <p className="text-xs text-purple-600 dark:text-purple-400 opacity-80 mt-1">
            Ready for packing
          </p>
        </CardContent>
      </Card>

      <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Packed Quantity
          </CardTitle>
          <Package className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{packedQuantity.toLocaleString()} kg</div>
          <p className="text-xs text-amber-600 dark:text-amber-400 opacity-80 mt-1">
            Processed today
          </p>
        </CardContent>
      </Card>

      <Card className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-400">
            Remaining Stock
          </CardTitle>
          <Truck className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">{remaining.toLocaleString()} kg</div>
          <p className="text-xs text-rose-600 dark:text-rose-400 opacity-80 mt-1">
            Unpacked inventory
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
