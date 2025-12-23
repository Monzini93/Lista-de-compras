import { useState } from 'react';
import { ShoppingItem, UnitType } from '../types';
import { calculateItemTotalPrice, getPriceUnitLabel } from '../utils/conversions';
import './ProductItem.css';

interface ProductItemProps {
  item: ShoppingItem;
  onTogglePurchased: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ShoppingItem>) => void;
  onRemove: (id: string) => void;
}

export const ProductItem = ({
  item,
  onTogglePurchased,
  onUpdate,
  onRemove,
}: ProductItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());
  const [editUnit, setEditUnit] = useState<UnitType>(item.unit);
  const [editPrice, setEditPrice] = useState(item.price?.toString() || '');

  const handleSave = () => {
    const qty = parseFloat(editQuantity);
    const priceValue = editPrice ? parseFloat(editPrice) : undefined;
    if (editName.trim() && qty > 0) {
      onUpdate(item.id, {
        name: editName,
        quantity: qty,
        unit: editUnit,
        price: priceValue && priceValue > 0 ? priceValue : undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(item.name);
    setEditQuantity(item.quantity.toString());
    setEditUnit(item.unit);
    setEditPrice(item.price?.toString() || '');
    setIsEditing(false);
  };

  const getUnitLabel = (unit: UnitType): string => {
    switch (unit) {
      case 'L':
        return 'L';
      case 'Kg':
        return 'Kg';
      case 'g':
        return 'g';
      case 'un':
        return 'un';
      default:
        return unit;
    }
  };

  if (isEditing) {
    return (
      <div className="product-item editing">
        <div className="edit-form">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="edit-input"
          />
          <div className="edit-quantity-unit">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              className="edit-input quantity"
            />
            <select
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value as UnitType)}
              className="edit-select"
            >
              <option value="un">un</option>
              <option value="L">L</option>
              <option value="Kg">Kg</option>
              <option value="g">g</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              {editUnit === 'g' ? 'Preço por Kg (R$)' : 
               editUnit === 'Kg' ? 'Preço por Kg (R$)' :
               editUnit === 'L' ? 'Preço por Litro (R$)' :
               'Preço por Unidade (R$)'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="edit-input"
              placeholder="0.00"
            />
            {editUnit === 'g' && (
              <small className="price-hint">
                💡 Informe o preço por Kg. Será calculado para {editQuantity || '0'}g
              </small>
            )}
          </div>
          <div className="edit-actions">
            <button onClick={handleSave} className="btn-save">
              ✓ Salvar
            </button>
            <button onClick={handleCancel} className="btn-cancel">
              ✕ Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-item ${item.purchased ? 'purchased' : ''}`}>
      <div className="item-content">
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={() => onTogglePurchased(item.id)}
          className="checkbox"
        />
        <div className="item-info">
          <span className="item-name">{item.name}</span>
          <div className="item-details">
            <span className="item-quantity">
              {item.quantity} {getUnitLabel(item.unit)}
            </span>
            {item.price && item.price > 0 && (
              <>
                <span className="item-price-info">
                  R$ {item.price.toFixed(2)} / {getPriceUnitLabel(item.unit)}
                  {item.unit === 'g' && ' (preço por Kg)'}
                </span>
                <span className="item-total">
                  Total: R$ {calculateItemTotalPrice(item.price, item.quantity, item.unit).toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="item-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="btn-edit"
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="btn-delete"
          title="Remover"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

