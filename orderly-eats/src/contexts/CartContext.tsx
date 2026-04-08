// orderly-eats/src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product, CartItem } from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, storeId: string) => void; // Atualizado para receber storeId
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryFee: (fee: number) => void;
  deliveryFee: number;
  subtotal: number;
  total: number;
  itemCount: number;
  currentStoreId: string | null; // Adicionado para controle de estado
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);

  const addItem = useCallback((product: Product, storeId: string) => {
    setItems(prev => {
      // Se o usuário tentar adicionar um item de uma loja diferente, 
      // o carrinho é limpo automaticamente para a nova loja.
      if (currentStoreId && storeId !== currentStoreId) {
        setCurrentStoreId(storeId);
        return [{ product, quantity: 1 }];
      }
      
      if (!currentStoreId) setCurrentStoreId(storeId);

      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, [currentStoreId]);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.product.id !== productId);
      if (newItems.length === 0) setCurrentStoreId(null); // Se esvaziar, reseta a loja
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => {
        const newItems = prev.filter(i => i.product.id !== productId);
        if (newItems.length === 0) setCurrentStoreId(null);
        return newItems;
      });
      return;
    }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDeliveryFee(0);
    setCurrentStoreId(null); // Crucial para permitir troca de lojas
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, clearCart, 
      setDeliveryFee, deliveryFee, subtotal, total, itemCount,
      currentStoreId 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}