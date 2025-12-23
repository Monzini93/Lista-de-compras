import { NormalizedPriceItem } from '../types';
import './PriceComparisonTable.css';

interface PriceComparisonTableProps {
  items: NormalizedPriceItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const PriceComparisonTable = ({
  items,
  onRemove,
  onClear,
}: PriceComparisonTableProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getBaseUnit = (unit: string): string => {
    if (unit === 'g') return 'Kg';
    return unit;
  };

  if (items.length === 0) {
    return (
      <div className="price-comparison-table empty">
        <p className="empty-message">
          💰 Adicione produtos para comparar preços!
        </p>
      </div>
    );
  }

  return (
    <div className="price-comparison-table">
      <div className="table-header">
        <h2>Comparação de Preços</h2>
        {items.length > 0 && (
          <button onClick={onClear} className="btn-clear">
            🗑️ Limpar Comparação
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Quantidade</th>
              <th>Preço por {getBaseUnit(items[0]?.unit || 'L')}</th>
              <th>Melhor Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const isBestValue = index === 0;
              const baseUnit = getBaseUnit(item.unit);

              return (
                <tr key={item.id} className={isBestValue ? 'best-value' : ''}>
                  <td className="product-name">{item.name}</td>
                  <td className="price">{formatCurrency(item.price)}</td>
                  <td className="quantity">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="normalized-price">
                    {formatCurrency(item.normalizedPrice)}/{baseUnit}
                  </td>
                  <td className="best-value-indicator">
                    {isBestValue && (
                      <span className="badge-best">🏆 Melhor</span>
                    )}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="btn-remove"
                      title="Remover"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-info">
        <p>
          💡 Os produtos são ordenados automaticamente pelo melhor
          custo-benefício (menor preço por {getBaseUnit(items[0]?.unit || 'L')}).
        </p>
      </div>
    </div>
  );
};

