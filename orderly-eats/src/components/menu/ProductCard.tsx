// orderly-eats/src/components/menu/ProductCard.tsx
import { useState, useMemo } from 'react';
import { Plus, Minus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import type { Product } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (options?: { name: string; price: number }[]) => void;
  onUpdateQty: (qty: number) => void;
  storeNiche?: string; // Adicionado para saber se aplicamos a regra de pizzaria
}

export default function ProductCard({ product, quantity, onAdd, onUpdateQty, storeNiche }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ name: string; price: number; groupId: string }[]>([]);

  const hasOptions = product.optionGroups && product.optionGroups.length > 0;

  // --- LÓGICA DE PREÇO DINÂMICO (ADS) ---
  const totalPrice = useMemo(() => {
    // Se for Pizzaria e o grupo for de "Sabores" ou "Metades"
    // Regra: Cobrar o maior valor entre as opções selecionadas desse grupo específico
    if (storeNiche === 'pizzaria') {
      const pizzaOptions = selectedOptions.filter(o => 
        o.groupId.toLowerCase().includes('sabor') || o.groupId.toLowerCase().includes('metade')
      );

      const otherOptions = selectedOptions.filter(o => 
        !pizzaOptions.includes(o)
      );

      const maxPizzaPrice = pizzaOptions.length > 0 
        ? Math.max(...pizzaOptions.map(o => o.price)) 
        : 0;

      const sumOthers = otherOptions.reduce((acc, opt) => acc + opt.price, 0);
      
      // Para pizza, o preço base geralmente é 0 ou o valor da massa, e o sabor define o preço
      return (product.price > 0 ? product.price : 0) + maxPizzaPrice + sumOthers;
    }

    // Lógica padrão (Açaí, Lanches, etc): Soma tudo
    const optionsCost = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
    return product.price + optionsCost;
  }, [product.price, selectedOptions, storeNiche]);

  const handleAddClick = () => {
    if (hasOptions && quantity === 0) {
      setIsModalOpen(true);
    } else {
      onAdd();
    }
  };

  const toggleOption = (option: { name: string; price: number }, groupId: string, maxOptions: number) => {
    setSelectedOptions(prev => {
      const isSelected = prev.some(o => o.name === option.name);
      if (isSelected) return prev.filter(o => o.name !== option.name);

      const currentGroupCount = prev.filter(o => o.groupId === groupId).length;
      if (currentGroupCount >= maxOptions) {
        toast.warning(`Limite de ${maxOptions} itens atingido neste grupo.`);
        return prev;
      }

      return [...prev, { ...option, groupId }];
    });
  };

  const handleConfirmOptions = () => {
    // Validação de Mínimos
    for (const group of product.optionGroups || []) {
      const count = selectedOptions.filter(o => o.groupId === group.id).length;
      if (count < group.minOptions) {
        toast.error(`Selecione no mínimo ${group.minOptions} em "${group.name}"`);
        return;
      }
    }

    onAdd(selectedOptions.map(({ name, price }) => ({ name, price })));
    setIsModalOpen(false);
    setSelectedOptions([]);
  };

  return (
    <>
      <div className="flex gap-3 p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/30"><ImageIcon /></div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
            {product.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{product.description}</p>}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="font-black text-primary text-sm">{formatCurrency(product.price)}</span>
            
            {quantity === 0 ? (
              <Button size="sm" className="h-8 rounded-full px-4 text-xs font-bold" onClick={handleAddClick}>
                Adicionar
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-7 w-7 rounded-full" onClick={() => onUpdateQty(quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-bold">{quantity}</span>
                <Button size="icon" className="h-7 w-7 rounded-full" onClick={handleAddClick} disabled={hasOptions}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden rounded-3xl">
          <div className="p-6 pb-4">
            <DialogTitle className="text-xl font-black uppercase italic">Personalize</DialogTitle>
            <p className="text-xs text-muted-foreground">{product.name}</p>
          </div>

          <div className="px-6 space-y-6 max-h-[50vh] overflow-y-auto">
            {product.optionGroups?.map(group => (
              <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
                  <h4 className="font-bold text-xs uppercase">{group.name}</h4>
                  <Badge variant="outline" className="text-[9px]">Até {group.maxOptions}</Badge>
                </div>
                
                <div className="grid gap-2">
                  {group.options.map(option => (
                    <label key={option.id} className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/30 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedOptions.some(o => o.name === option.name)}
                          onCheckedChange={() => toggleOption({ name: option.name, price: option.price }, group.id, group.maxOptions)}
                        />
                        <span className="text-sm font-medium">{option.name}</span>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {option.price > 0 ? `+ ${formatCurrency(option.price)}` : 'Grátis'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="p-6 bg-muted/20 flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold uppercase text-muted-foreground">Total do Item</span>
              <span className="text-xl font-black text-primary">{formatCurrency(totalPrice)}</span>
            </div>
            <Button onClick={handleConfirmOptions} className="w-full h-12 rounded-xl font-black uppercase italic tracking-widest">
              Confirmar Escolha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}