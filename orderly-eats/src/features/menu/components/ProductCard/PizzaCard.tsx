// src/features/menu/components/ProductCard/PizzaCard.tsx
import { useState, useMemo } from 'react';
import { Plus, Minus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ProductCardProps } from './index'; // Importando a interface do Maestro

export default function PizzaCard({ product, quantity, onAdd, onUpdateQty }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);

  // REGRA: Considera o preço promocional se existir
  const basePriceForCalculation = product.promoPrice || product.price;

  const totalPrice = useMemo(() => {
    if (selectedOptions.length === 0) return basePriceForCalculation;
    
    const flavors = selectedOptions.filter(opt => 
      opt.groupName.toLowerCase().includes('sabor') || 
      opt.groupName.toLowerCase().includes('metade')
    );
    const extras = selectedOptions.filter(opt => !flavors.includes(opt));
    
    // REGRA PIZZARIA: Maior valor entre as metades + soma dos extras
    const priceFromFlavors = flavors.length > 0 
      ? Math.max(...flavors.map(f => f.price)) 
      : basePriceForCalculation;

    const extrasPrice = extras.reduce((acc, curr) => acc + curr.price, 0);
    
    return priceFromFlavors + extrasPrice;
  }, [basePriceForCalculation, selectedOptions]);

  const toggleOption = (option: any, groupId: string, groupName: string, maxOptions: number) => {
    setSelectedOptions(prev => {
      if (prev.some(o => o.name === option.name)) return prev.filter(o => o.name !== option.name);
      if (prev.filter(o => o.groupId === groupId).length >= maxOptions) {
        toast.warning(`Máximo de ${maxOptions} itens atingido em ${groupName}.`);
        return prev;
      }
      return [...prev, { ...option, groupId, groupName }];
    });
  };

  const handleConfirm = () => {
    onAdd(selectedOptions);
    setIsModalOpen(false);
    // Não limpamos o selectedOptions aqui para que o botão de "+" 
    // possa repetir a mesma configuração se necessário.
  };

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white border border-red-100 shadow-sm hover:shadow-md transition-all">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500 flex-shrink-0 relative">
        {product.imageUrl ? (
          <img src={product.imageUrl} className="object-cover h-full w-full" alt={product.name} />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-red-50 text-red-200"><ImageIcon /></div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-red-900 leading-tight">{product.name}</h3>
          {product.promoPrice && <Badge className="bg-red-600 text-[8px] h-4">OFERTA</Badge>}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col">
            <span className="font-black text-red-600 text-sm">
              {formatCurrency(product.promoPrice || product.price)}
            </span>
            {product.promoPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <Button size="sm" variant="destructive" className="h-8 rounded-full px-4 text-xs font-bold" onClick={() => setIsModalOpen(true)}>
              Montar
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="h-7 w-7 rounded-full border-red-200 text-red-600" onClick={() => onUpdateQty(quantity - 1, selectedOptions)}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-bold text-red-900">{quantity}</span>
              <Button size="icon" className="h-7 w-7 rounded-full bg-red-600" onClick={() => onAdd(selectedOptions)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-[400px]">
          <div className="p-4">
            <DialogTitle className="font-black italic text-2xl text-red-600 uppercase tracking-tighter">Personalize sua Pizza</DialogTitle>
            <p className="text-xs text-gray-400">{product.name}</p>
          </div>

          <div className="space-y-6 max-h-[50vh] overflow-y-auto px-4 scrollbar-hide">
            {product.optionGroups?.map((group: any) => (
              <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center bg-red-50 p-2 rounded-lg">
                  <h4 className="font-bold text-[10px] uppercase text-red-800">{group.name}</h4>
                  <Badge variant="outline" className="text-[9px] border-red-200 text-red-600">Até {group.maxOptions}</Badge>
                </div>
                {group.options.map((option: any) => (
                  <label key={option.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-red-50/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        checked={selectedOptions.some(o => o.name === option.name)} 
                        onCheckedChange={() => toggleOption(option, group.id, group.name, group.maxOptions)} 
                      />
                      <span className="text-sm font-bold text-gray-700">{option.name}</span>
                    </div>
                    <span className="text-xs font-bold text-red-500">+{formatCurrency(option.price)}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>

          <DialogFooter className="p-6 bg-red-50/50 flex-col gap-4">
            <div className="flex justify-between w-full items-center">
              <span className="text-xs font-bold uppercase text-red-800/60">Subtotal</span>
              <span className="text-2xl font-black text-red-600">{formatCurrency(totalPrice)}</span>
            </div>
            <Button className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-red-200" onClick={handleConfirm}>
              Confirmar Sabores
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}