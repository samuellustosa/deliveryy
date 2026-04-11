// src/features/menu/components/ProductCard/index.tsx
import PizzaCard from './PizzaCard';
import AcaiCard from './AcaiCard';
import DefaultCard from './DefaultCard';
import type { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (options?: { name: string; price: number }[]) => void;
  // ATUALIZAÇÃO AQUI: Aceitar o segundo argumento opcional (options)
  onUpdateQty: (qty: number, options?: { name: string; price: number }[]) => void;
  storeNiche?: string; 
}

export default function ProductCard(props: ProductCardProps) {
  // O Maestro agora repassa corretamente os argumentos para os cards específicos
  switch (props.storeNiche) {
    case 'pizzaria':
      return <PizzaCard {...props} />;
    case 'acaiteria':
      return <AcaiCard {...props} />;
    default:
      return <DefaultCard {...props} />;
  }
}