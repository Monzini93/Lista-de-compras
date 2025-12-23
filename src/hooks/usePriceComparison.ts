import { useState, useEffect, useMemo } from 'react';
import { PriceComparisonItem, NormalizedPriceItem } from '../types';
import { storage } from '../utils/storage';
import {
  calculateNormalizedPrice,
  sortByBestValue,
} from '../utils/conversions';

export const usePriceComparison = () => {
  const [items, setItems] = useState<PriceComparisonItem[]>(() => {
    return storage.loadPriceComparison();
  });

  useEffect(() => {
    storage.savePriceComparison(items);
  }, [items]);

  const addItem = (
    name: string,
    price: number,
    quantity: number,
    unit: 'L' | 'Kg' | 'g'
  ) => {
    const newItem: PriceComparisonItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      price,
      quantity,
      unit,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearList = () => {
    setItems([]);
    storage.clearPriceComparison();
  };

  // Calcular preços normalizados e ordenar por melhor custo-benefício
  const normalizedItems: NormalizedPriceItem[] = useMemo(() => {
    const normalized = items.map(calculateNormalizedPrice);
    return sortByBestValue(normalized);
  }, [items]);

  return {
    items,
    normalizedItems,
    addItem,
    removeItem,
    clearList,
  };
};

