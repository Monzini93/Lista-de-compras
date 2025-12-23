import { ShoppingItem, UnitType } from '../types';
import { ProductItem } from './ProductItem';
import './ProductList.css';

interface ProductListProps {
  items: ShoppingItem[];
  onTogglePurchased: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ShoppingItem>) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  pendingCount: number;
  totalAmount: number;
}

export const ProductList = ({
  items,
  onTogglePurchased,
  onUpdate,
  onRemove,
  onClear,
  pendingCount,
  totalAmount,
}: ProductListProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  if (items.length === 0) {
    return (
      <div className="product-list empty">
        <p className="empty-message">
          📝 Sua lista está vazia. Adicione produtos para começar!
        </p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="list-header">
        <h2>Lista de Compras</h2>
        <div className="list-stats">
          <span className="pending-count">
            {pendingCount} {pendingCount === 1 ? 'item pendente' : 'itens pendentes'}
          </span>
          {items.length > 0 && (
            <button onClick={onClear} className="btn-clear">
              🗑️ Limpar Lista
            </button>
          )}
        </div>
      </div>

      <div className="items-container">
        {items.map((item) => (
          <ProductItem
            key={item.id}
            item={item}
            onTogglePurchased={onTogglePurchased}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>

      {totalAmount > 0 && (
        <div className="total-section">
          <div className="total-amount">
            <span className="total-label">💰 Total da Compra:</span>
            <span className="total-value">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

