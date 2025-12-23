import { usePriceComparison } from '../hooks/usePriceComparison';
import { PriceComparisonForm } from '../components/PriceComparisonForm';
import { PriceComparisonTable } from '../components/PriceComparisonTable';
import './PriceComparison.css';

export const PriceComparison = () => {
  const { items, normalizedItems, addItem, removeItem, clearList } =
    usePriceComparison();

  return (
    <div className="price-comparison-page">
      <div className="page-container">
        <PriceComparisonForm onAdd={addItem} />
        <PriceComparisonTable
          items={normalizedItems}
          onRemove={removeItem}
          onClear={clearList}
        />
      </div>
    </div>
  );
};

