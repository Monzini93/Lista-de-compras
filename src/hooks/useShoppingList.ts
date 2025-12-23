import { useState, useEffect } from 'react';
import { ShoppingItem, UnitType } from '../types';
import { storage } from '../utils/storage';
import { calculateItemTotalPrice } from '../utils/conversions';

export const useShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    return storage.loadShoppingList();
  });

  useEffect(() => {
    storage.saveShoppingList(items);
  }, [items]);

  const addItem = (name: string, quantity: number, unit: UnitType, price?: number) => {
    const newItem: ShoppingItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      quantity,
      unit,
      price: price && price > 0 ? price : undefined,
      purchased: false,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<ShoppingItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const togglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const clearList = () => {
    setItems([]);
    storage.clearShoppingList();
  };

  const pendingCount = items.filter((item) => !item.purchased).length;

  // Calcular total geral da compra
  const totalAmount = items.reduce((sum, item) => {
    if (item.price && item.price > 0) {
      return sum + calculateItemTotalPrice(item.price, item.quantity, item.unit);
    }
    return sum;
  }, 0);

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    togglePurchased,
    clearList,
    pendingCount,
    totalAmount,
  };
};

