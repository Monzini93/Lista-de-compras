export type UnitType = 'L' | 'un' | 'Kg' | 'g';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  price?: number; // Preço por unidade (opcional)
  purchased: boolean;
}

export interface PriceComparisonItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: 'L' | 'Kg' | 'g';
}

export interface NormalizedPriceItem extends PriceComparisonItem {
  normalizedPrice: number; // Preço por litro ou por kg
  pricePerBaseUnit: number;
}

