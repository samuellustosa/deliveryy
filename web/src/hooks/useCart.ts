import { useState, useCallback } from "react";

// Definimos a interface do Produto para bater com o seu schema.prisma do Backend
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
}

// O item do carrinho estende o Produto adicionando a quantidade
export interface CartItem extends Product {
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Adiciona um item ao carrinho
  const addItem = useCallback((item: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  // Remove ou diminui a quantidade de um item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  // Limpa todo o carrinho (útil após finalizar o pedido)
  const clearCart = useCallback(() => setItems([]), []);

  // Cálculos automáticos baseados nos itens reais do banco
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return { 
    items, 
    addItem, 
    removeItem, 
    clearCart, 
    total, 
    totalItems, 
    isOpen, 
    setIsOpen 
  };
}