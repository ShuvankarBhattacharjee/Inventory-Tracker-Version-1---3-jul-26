export type MushroomVariety = "Button" | "Oyster" | "Milky" | "Cremini" | "Portobello";

export interface InventoryItem {
  id: string;
  variety: MushroomVariety;
  purchased: number;
  ownProduction: number;
  packedQuantity: number;
  totalAvailable: number;
  remaining: number;
  date: string;
}
