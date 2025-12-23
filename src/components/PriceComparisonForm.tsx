import { useState, FormEvent } from 'react';
import './PriceComparisonForm.css';

type PriceUnit = 'L' | 'Kg' | 'g';

interface PriceComparisonFormProps {
  onAdd: (name: string, price: number, quantity: number, unit: PriceUnit) => void;
}

export const PriceComparisonForm = ({ onAdd }: PriceComparisonFormProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<PriceUnit>('L');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    const qty = parseFloat(quantity);
    if (name.trim() && priceValue > 0 && qty > 0) {
      onAdd(name, priceValue, qty, unit);
      setName('');
      setPrice('');
      setQuantity('');
      setUnit('L');
    }
  };

  return (
    <form className="price-comparison-form" onSubmit={handleSubmit}>
      <h3>Adicionar Produto para Comparação</h3>
      
      <div className="form-group">
        <label htmlFor="price-name">Nome do Produto</label>
        <input
          id="price-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Leite Integral"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price-value">Preço (R$)</label>
          <input
            id="price-value"
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price-quantity">Quantidade</label>
          <input
            id="price-quantity"
            type="number"
            step="0.01"
            min="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price-unit">Unidade</label>
          <select
            id="price-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as PriceUnit)}
          >
            <option value="L">Litro (L)</option>
            <option value="Kg">Quilograma (Kg)</option>
            <option value="g">Grama (g)</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn-add-price">
        ➕ Adicionar para Comparação
      </button>
    </form>
  );
};

