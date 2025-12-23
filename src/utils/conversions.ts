import { UnitType, PriceComparisonItem, NormalizedPriceItem } from '../types';

/**
 * Converte gramas para quilogramas
 */
export const gramsToKilograms = (grams: number): number => {
  return grams / 1000;
};

/**
 * Converte quilogramas para gramas
 */
export const kilogramsToGrams = (kilograms: number): number => {
  return kilograms * 1000;
};

/**
 * Normaliza a quantidade para a unidade base (Kg ou L)
 */
export const normalizeQuantity = (quantity: number, unit: UnitType): number => {
  switch (unit) {
    case 'g':
      return gramsToKilograms(quantity);
    case 'Kg':
    case 'L':
    case 'un':
      return quantity;
    default:
      return quantity;
  }
};

/**
 * Calcula o preço normalizado por unidade base (preço por litro ou preço por kg)
 */
export const calculateNormalizedPrice = (
  item: PriceComparisonItem
): NormalizedPriceItem => {
  let normalizedQuantity: number;
  let baseUnit: 'L' | 'Kg';

  // Normalizar quantidade para unidade base
  if (item.unit === 'g') {
    normalizedQuantity = gramsToKilograms(item.quantity);
    baseUnit = 'Kg';
  } else if (item.unit === 'Kg') {
    normalizedQuantity = item.quantity;
    baseUnit = 'Kg';
  } else {
    // item.unit === 'L'
    normalizedQuantity = item.quantity;
    baseUnit = 'L';
  }

  // Calcular preço por unidade base
  const pricePerBaseUnit = item.price / normalizedQuantity;
  const normalizedPrice = pricePerBaseUnit;

  return {
    ...item,
    normalizedPrice,
    pricePerBaseUnit,
  };
};

/**
 * Ordena itens por melhor custo-benefício (menor preço por unidade base)
 */
export const sortByBestValue = (
  items: NormalizedPriceItem[]
): NormalizedPriceItem[] => {
  return [...items].sort((a, b) => a.normalizedPrice - b.normalizedPrice);
};

/**
 * Calcula o preço total de um item baseado na unidade
 * Quando a unidade é "g", o preço informado é por Kg
 */
export const calculateItemTotalPrice = (
  price: number,
  quantity: number,
  unit: UnitType
): number => {
  if (unit === 'g') {
    // Preço informado é por Kg, calcular proporcionalmente
    const quantityInKg = gramsToKilograms(quantity);
    return price * quantityInKg;
  }
  // Para outras unidades, multiplicar diretamente
  return price * quantity;
};

/**
 * Retorna o label do preço baseado na unidade
 */
export const getPriceLabel = (unit: UnitType): string => {
  switch (unit) {
    case 'g':
      return 'Preço por Kg (R$)';
    case 'Kg':
      return 'Preço por Kg (R$)';
    case 'L':
      return 'Preço por Litro (R$)';
    case 'un':
      return 'Preço por Unidade (R$)';
    default:
      return 'Preço (R$)';
  }
};

/**
 * Retorna o label do preço unitário para exibição
 */
export const getPriceUnitLabel = (unit: UnitType): string => {
  switch (unit) {
    case 'g':
      return 'Kg'; // Quando é grama, o preço é por Kg
    case 'Kg':
      return 'Kg';
    case 'L':
      return 'L';
    case 'un':
      return 'un';
    default:
      return unit;
  }
};

