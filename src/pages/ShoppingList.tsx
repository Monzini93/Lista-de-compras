import { useState } from 'react';
import { useShoppingLists } from '../hooks/useShoppingLists';
import { ProductForm } from '../components/ProductForm';
import { ProductList } from '../components/ProductList';
import './ShoppingList.css';

export const ShoppingList = () => {
  const {
    lists,
    currentList,
    currentListId,
    setCurrentListId,
    loading,
    error,
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
  } = useShoppingLists();

  const [newListName, setNewListName] = useState('');
  const [renaming, setRenaming] = useState(false);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    try {
      await createList(newListName);
      setNewListName('');
    } catch (err) {
      console.error('Erro ao criar lista:', err);
    }
  };

  const handleRenameList = async () => {
    if (!newListName.trim() || !currentList) return;
    
    try {
      await renameList(newListName);
      setRenaming(false);
      setNewListName('');
    } catch (err) {
      console.error('Erro ao renomear lista:', err);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta lista?')) {
      try {
        await deleteList(listId);
      } catch (err) {
        console.error('Erro ao deletar lista:', err);
      }
    }
  };

  if (loading) {
    return <div className="shopping-list-page"><div className="loading">Carregando...</div></div>;
  }

  if (error) {
    return <div className="shopping-list-page"><div className="error">{error}</div></div>;
  }

  return (
    <div className="shopping-list-page">
      <div className="page-container">
        {/* Gerenciar listas */}
        <div className="lists-manager">
          <div className="list-creation">
            <form onSubmit={handleCreateList} className="create-list-form">
              <input
                type="text"
                placeholder="Nova lista..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <button type="submit">+ Criar</button>
            </form>
          </div>

          {lists.length > 0 && (
            <div className="lists-tabs">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className={`list-tab ${currentListId === list.id ? 'active' : ''}`}
                >
                  <button
                    onClick={() => setCurrentListId(list.id)}
                    className="tab-button"
                  >
                    {list.title}
                  </button>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="tab-delete"
                    title="Deletar lista"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentList && (
          <>
            <div className="list-header">
              {renaming ? (
                <div className="rename-form">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handleRenameList}>Salvar</button>
                  <button onClick={() => setRenaming(false)}>Cancelar</button>
                </div>
              ) : (
                <>
                  <h2>{currentList.title}</h2>
                  <button onClick={() => { setRenaming(true); setNewListName(currentList.title); }} className="rename-btn">
                    Renomear
                  </button>
                </>
              )}
            </div>

            <ProductForm onAdd={addItemToList} />
            <ProductList
              items={currentList.items}
              onTogglePurchased={togglePurchased}
              onUpdate={updateItem}
              onRemove={removeItem}
              onClear={clearList}
              pendingCount={getPendingCount()}
              totalAmount={getTotalPrice()}
            />
          </>
        )}
      </div>
    </div>
  );
};

