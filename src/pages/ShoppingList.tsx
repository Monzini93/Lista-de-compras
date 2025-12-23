import { useShoppingList } from '../hooks/useShoppingList';
import { ProductForm } from '../components/ProductForm';
import { ProductList } from '../components/ProductList';
import './ShoppingList.css';

export const ShoppingList = () => {
  const {
    items,
    addItem,
    updateItem,
    removeItem,
    togglePurchased,
    clearList,
    pendingCount,
    totalAmount,
  } = useShoppingList();

  return (
    <div className="shopping-list-page">
      <div className="page-container">
        <ProductForm onAdd={addItem} />
        <ProductList
          items={items}
          onTogglePurchased={togglePurchased}
          onUpdate={updateItem}
          onRemove={removeItem}
          onClear={clearList}
          pendingCount={pendingCount}
          totalAmount={totalAmount}
        />
      </div>
    </div>
  );
};

