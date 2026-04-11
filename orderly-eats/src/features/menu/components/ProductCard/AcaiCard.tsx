// src/features/menu/components/ProductCard/AcaiCard.tsx
import { useState, useMemo } from 'react';
import { Plus, Minus, ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/api';

export default function AcaiCard({ product, quantity, onAdd, onUpdateQty }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);

  // REGRA AÇAÍ: Soma o preço base + todos os adicionais
  const totalPrice = useMemo(() => {
    const optionsCost = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
    return product.price + optionsCost;
  }, [product.price, selectedOptions]);

  const toggleOption = (option: any, groupId: string, groupName: string, maxOptions: number) => {
    setSelectedOptions(prev => {
      const isSelected = prev.some(o => o.name === option.name);
      if (isSelected) return prev.filter(o => o.name !== option.name);

      const currentGroupCount = prev.filter(o => o.groupId === groupId).length;
      if (currentGroupCount >= maxOptions) {
        toast.warning(`Limite de ${maxOptions} itens atingido em "${groupName}".`);
        return prev;
      }

      return [...prev, { ...option, groupId, groupName }];
    });
  };

  const handleConfirm = () => {
    for (const group of product.optionGroups || []) {
      const count = selectedOptions.filter(o => o.groupId === group.id).length;
      if (count < group.minOptions) {
        toast.error(`Selecione no mínimo ${group.minOptions} em "${group.name}"`);
        return;
      }
    }
    onAdd(selectedOptions);
    setIsModalOpen(false);
    setSelectedOptions([]);
  };

  return (
    <div className="flex gap-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-100 shadow-sm hover:shadow-md transition-all">
      {/* Imagem com borda roxa */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-purple-100 overflow-hidden border-2 border-purple-200">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-purple-300"><ImageIcon /></div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-purple-900 leading-tight">{product.name}</h3>
          {product.description && <p className="text-[10px] text-purple-700/60 line-clamp-2 mt-1">{product.description}</p>}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-black text-purple-700 text-sm">{formatCurrency(product.price)}</span>
          
          <Button 
            size="sm" 
            className="h-8 rounded-full px-4 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white border-none"
            onClick={() => setIsModalOpen(true)}
          >
            Montar Copo
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden rounded-[32px] border-purple-100">
          <div className="p-6 pb-4 bg-purple-600 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 fill-white" />
              <DialogTitle className="text-xl font-black uppercase italic">Monte seu Açaí</DialogTitle>
            </div>
            <p className="text-xs text-purple-100 opacity-80">{product.name}</p>
          </div>

          <div className="px-6 py-4 space-y-6 max-h-[50vh] overflow-y-auto scrollbar-hide">
            {product.optionGroups?.map((group: any) => (
              <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center bg-purple-50 p-2 rounded-lg border border-purple-100">
                  <h4 className="font-bold text-[10px] uppercase text-purple-700 tracking-wider">{group.name}</h4>
                  <Badge variant="secondary" className="text-[9px] bg-purple-200 text-purple-800">Até {group.maxOptions}</Badge>
                </div>
                
                <div className="grid gap-2">
                  {group.options.map((option: any) => (
                    <label key={option.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer transition-all">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          checked={selectedOptions.some(o => o.name === option.name)}
                          onCheckedChange={() => toggleOption(option, group.id, group.name, group.maxOptions)}
                        />
                        <span className="text-sm font-medium text-gray-700">{option.name}</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600">
                        {option.price > 0 ? `+ ${formatCurrency(option.price)}` : 'Grátis'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="p-6 bg-gray-50 flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold uppercase text-gray-400">Total do Copo</span>
              <span className="text-2xl font-black text-purple-700">{formatCurrency(totalPrice)}</span>
            </div>
            <Button 
              onClick={handleConfirm} 
              className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
            >
              Adicionar ao Carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}