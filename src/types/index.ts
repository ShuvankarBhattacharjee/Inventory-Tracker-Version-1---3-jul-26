export type MushroomVariety = "Button" | "Oyster" | "Milky" | "Cremini" | "Portobello" | string;

export interface Product {
  id: string;
  variety: MushroomVariety;
  initialQuantity: number;
  availableQuantity: number;
}

export type OrderStatus = "Pending" | "Packed";

export interface Order {
  id: string;
  customerName: string;
  product: MushroomVariety;
  quantity: number; // Quantity per pack
  unit: "KG" | "GM"; // Unit for the pack
  pricePerPack: number;
  itemsOrPackets: number;
  totalQuantityKg: number; // Normalized total quantity in KG
  totalAmount: number; // pricePerPack * itemsOrPackets
  status: OrderStatus;
  date: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderReference: string;
  date: string;
  grandTotal: number;
}
