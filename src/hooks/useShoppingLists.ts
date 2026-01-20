import { useState, useEffect, useCallback } from 'react';
import { ShoppingItem, UnitType } from '../types';
import { shoppingListAPI } from '../services/api';
import { calculateItemTotalPrice } from '../utils/conversions';

export interface ShoppingListData {
  id: string;
  title: string;
  items: ShoppingItem[];
  createdAt: string;
}

export const useShoppingLists = () => {
  const [lists, setLists] = useState<ShoppingListData[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar listas ao montar
  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shoppingListAPI.getLists();
      
      // Validar que data é um array
      if (!Array.isArray(data)) {
        console.error('Dados inválidos recebidos da API:', data);
        setError('Formato de dados inválido recebido do servidor');
        setLists([]);
        return;
      }
      
      // Validar e normalizar cada lista
      const validLists = data
        .filter((list: any) => list && typeof list === 'object' && list.id && list.title)
        .map((list: any) => ({
          id: String(list.id),
          title: String(list.title || ''),
          items: Array.isArray(list.items) ? list.items : [],
          createdAt: String(list.createdAt || new Date().toISOString()),
        }));
      
      setLists(validLists);
      if (validLists.length > 0 && !currentListId) {
        setCurrentListId(validLists[0].id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar listas';
      setError(errorMessage);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [currentListId]);

  const currentList = lists.find((l) => l.id === currentListId);

  const createList = useCallback(async (title: string) => {
    try {
      const newList = await shoppingListAPI.createList(title, []);
      setLists((prev) => [...prev, newList as ShoppingListData]);
      setCurrentListId(newList.id);
      return newList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lista');
      throw err;
    }
  }, []);

  const updateList = useCallback(async (id: string, title?: string, items?: ShoppingItem[]) => {
    try {
      const updated = await shoppingListAPI.updateList(id, title, items);
      setLists((prev) =>
        prev.map((l) => (l.id === id ? (updated as ShoppingListData) : l))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lista');
      throw err;
    }
  }, []);

  const deleteList = useCallback(async (id: string) => {
    try {
      await shoppingListAPI.deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
      if (currentListId === id) {
        setCurrentListId(lists[0]?.id || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar lista');
      throw err;
    }
  }, [currentListId, lists]);

  const addItemToList = useCallback(
    async (name: string, quantity: number, unit: UnitType, price?: number) => {
      if (!currentList) return;

      const newItem: ShoppingItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        quantity,
        unit,
        price: price && price > 0 ? price : undefined,
        purchased: false,
      };

      const updatedItems = [...currentList.items, newItem];
      await updateList(currentList.id, currentList.title, updatedItems);
    },
    [currentList, updateList]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<ShoppingItem>) => {
      if (!currentList) return;

      const updatedItems = currentList.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      await updateList(currentList.id, currentList.title, updatedItems);
    },
    [currentList, updateList]
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (!currentList) return;

      const updatedItems = currentList.items.filter((item) => item.id !== id);
      await updateList(currentList.id, currentList.title, updatedItems);
    },
    [currentList, updateList]
  );

  const togglePurchased = useCallback(
    async (id: string) => {
      if (!currentList) return;

      const updatedItems = currentList.items.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      );
      await updateList(currentList.id, currentList.title, updatedItems);
    },
    [currentList, updateList]
  );

  const renameList = useCallback(
    async (newTitle: string) => {
      if (!currentList) return;
      await updateList(currentList.id, newTitle, currentList.items);
    },
    [currentList, updateList]
  );

  const clearList = useCallback(async () => {
    if (!currentList) return;
    await updateList(currentList.id, currentList.title, []);
  }, [currentList, updateList]);

  const getTotalPrice = () => {
    if (!currentList) return 0;
    return currentList.items.reduce((sum, item) => {
      if (item.price && item.price > 0) {
        return sum + calculateItemTotalPrice(item.price, item.quantity, item.unit);
      }
      return sum;
    }, 0);
  };

  const getPendingCount = () => {
    if (!currentList) return 0;
    return currentList.items.filter((item) => !item.purchased).length;
  };

  return {
    lists,
    currentList,
    currentListId,
    setCurrentListId,
    loading,
    error,
    loadLists,
    createList,
    deleteList,
    renameList,
    addItemToList,
    updateItem,
    removeItem,
    togglePurchased,
    clearList,
    getTotalPrice,
    getPendingCount,
  };
};
