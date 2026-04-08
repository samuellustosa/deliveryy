import { Plus, Minus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onUpdateQty: (qty: number) => void;
}

export default function ProductCard({ product, quantity, onAdd, onUpdateQty }: ProductCardProps) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-sm text-foreground leading-tight">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-primary text-sm">
            R$ {product.price.toFixed(2)}
          </span>
          {quantity === 0 ? (
            <Button size="sm" className="h-8 rounded-full text-xs px-4" onClick={onAdd}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 rounded-full"
                onClick={() => onUpdateQty(quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-bold w-6 text-center">{quantity}</span>
              <Button
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={onAdd}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
