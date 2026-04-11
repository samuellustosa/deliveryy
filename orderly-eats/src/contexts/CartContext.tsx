// orderly-eats/src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product, CartItem } from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, storeId: string, selectedOptions?: { name: string; price: number }[]) => void;
  removeItem: (productId: string, options?: { name: string; price: number }[]) => void;
  updateQuantity: (productId: string, quantity: number, options?: { name: string; price: number }[]) => void;
  clearCart: () => void;
  setDeliveryFee: (fee: number) => void;
  deliveryFee: number;
  subtotal: number;
  total: number;
  itemCount: number;
  currentStoreId: string | null;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);

  const addItem = useCallback((
    product: Product, 
    storeId: string, 
    selectedOptions: { name: string; price: number }[] = []
  ) => {
    setItems(prev => {
      // 1. Limpa o carrinho se trocar de loja (Multitenancy)
      if (currentStoreId && storeId !== currentStoreId) {
        setCurrentStoreId(storeId);
        return [{ product, quantity: 1, selectedOptions }];
      }
      
      if (!currentStoreId) setCurrentStoreId(storeId);

      // 2. Lógica de Identidade: O item só é "igual" se ID + ADICIONAIS forem idênticos
      const optionsString = JSON.stringify(selectedOptions.sort((a, b) => a.name.localeCompare(b.name)));
      
      const existingIndex = prev.findIndex(i => {
        const itemOptionsString = JSON.stringify((i.selectedOptions || []).sort((a, b) => a.name.localeCompare(b.name)));
        return i.product.id === product.id && itemOptionsString === optionsString;
      });

      if (existingIndex !== -1) {
        const newItems = [...prev];
        newItems[existingIndex] = { 
          ...newItems[existingIndex], 
          quantity: newItems[existingIndex].quantity + 1 
        };
        return newItems;
      }

      // 3. Adiciona como novo item se a combinação for inédita
      return [...prev, { product, quantity: 1, selectedOptions }];
    });
  }, [currentStoreId]);

  const updateQuantity = useCallback((productId: string, quantity: number, options?: { name: string; price: number }[]) => {
    const optionsString = options ? JSON.stringify(options.sort((a, b) => a.name.localeCompare(b.name))) : "[]";

    setItems(prev => {
      const newItems = prev.map(i => {
        const itemOptionsString = JSON.stringify((i.selectedOptions || []).sort((a, b) => a.name.localeCompare(b.name)));
        if (i.product.id === productId && itemOptionsString === optionsString) {
          return { ...i, quantity };
        }
        return i;
      }).filter(i => i.quantity > 0);

      if (newItems.length === 0) setCurrentStoreId(null);
      return newItems;
    });
  }, []);

  const removeItem = useCallback((productId: string, options?: { name: string; price: number }[]) => {
    const optionsString = options ? JSON.stringify(options.sort((a, b) => a.name.localeCompare(b.name))) : "[]";
    
    setItems(prev => {
      const newItems = prev.filter(i => {
        const itemOptionsString = JSON.stringify((i.selectedOptions || []).sort((a, b) => a.name.localeCompare(b.name)));
        return !(i.product.id === productId && itemOptionsString === optionsString);
      });
      if (newItems.length === 0) setCurrentStoreId(null);
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDeliveryFee(0);
    setCurrentStoreId(null);
  }, []);

  // CÁLCULO DE SUBTOTAL: Soma o preço do produto + adicionais
  const subtotal = items.reduce((sum, item) => {
    const optionsTotal = (item.selectedOptions || []).reduce((s, opt) => s + opt.price, 0);
    // Se for pizza, o ProductCard já enviou o preço ajustado ou aqui somamos os extras
    return sum + (item.product.price + optionsTotal) * item.quantity;
  }, 0);

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