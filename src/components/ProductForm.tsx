import { useState, FormEvent } from 'react';
import { UnitType } from '../types';
import { getPriceLabel } from '../utils/conversions';
import './ProductForm.css';

interface ProductFormProps {
  onAdd: (name: string, quantity: number, unit: UnitType, price?: number) => void;
}

export const ProductForm = ({ onAdd }: ProductFormProps) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<UnitType>('un');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const priceValue = price ? parseFloat(price) : undefined;
    if (name.trim() && qty > 0) {
      onAdd(name, qty, unit, priceValue);
      setName('');
      setQuantity('');
      setPrice('');
      setUnit('un');
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="product-name">Nome do Produto</label>
        <input
          id="product-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Leite, Arroz, etc."
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="product-quantity">Quantidade</label>
          <input
            id="product-quantity"
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
          <label htmlFor="product-unit">Unidade</label>
          <select
            id="product-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as UnitType)}
          >
            <option value="un">Unidade (un)</option>
            <option value="L">Litro (L)</option>
            <option value="Kg">Quilograma (Kg)</option>
            <option value="g">Grama (g)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="product-price">
          {getPriceLabel(unit)} - Opcional
        </label>
        <input
          id="product-price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
        {unit === 'g' && (
          <small className="price-hint">
            💡 Informe o preço por Kg. Será calculado automaticamente para {quantity || '0'}g
          </small>
        )}
      </div>

      <button type="submit" className="btn-add">
        ➕ Adicionar
      </button>
    </form>
  );
};

