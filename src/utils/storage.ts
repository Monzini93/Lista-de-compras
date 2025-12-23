import { ShoppingItem, PriceComparisonItem } from '../types';

const SHOPPING_LIST_KEY = 'shopping-list';
const PRICE_COMPARISON_KEY = 'price-comparison';

export const storage = {
  // Shopping List
  saveShoppingList: (items: ShoppingItem[]): void => {
    try {
      localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Erro ao salvar lista de compras:', error);
    }
  },

  loadShoppingList: (): ShoppingItem[] => {
    try {
      const data = localStorage.getItem(SHOPPING_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar lista de compras:', error);
      return [];
    }
  },

  clearShoppingList: (): void => {
    try {
      localStorage.removeItem(SHOPPING_LIST_KEY);
    } catch (error) {
      console.error('Erro ao limpar lista de compras:', error);
    }
  },

  // Price Comparison
  savePriceComparison: (items: PriceComparisonItem[]): void => {
    try {
      localStorage.setItem(PRICE_COMPARISON_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Erro ao salvar comparação de preços:', error);
    }
  },

  loadPriceComparison: (): PriceComparisonItem[] => {
    try {
      const data = localStorage.getItem(PRICE_COMPARISON_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar comparação de preços:', error);
      return [];
    }
  },

  clearPriceComparison: (): void => {
    try {
      localStorage.removeItem(PRICE_COMPARISON_KEY);
    } catch (error) {
      console.error('Erro ao limpar comparação de preços:', error);
    }
  },
};

