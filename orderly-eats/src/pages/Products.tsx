// orderly-eats/src/pages/Products.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Loader2, ArrowRight, ArrowLeft, Settings2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
];

export default function Products() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    promoPrice: '',
    stock: '0',
    availableDays: [] as string[],
    categoryId: '',
    optionGroupsIds: [] as string[] 
  });

  const { data: products, isLoading: loadingProducts } = useQuery({ 
    queryKey: ['products'], 
    queryFn: () => api.getProducts() 
  });

  const { data: categories } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: () => api.getCategories() 
  });

  const { data: optionGroups } = useQuery({
    queryKey: ['option-groups'],
    queryFn: () => api.getOptionGroups()
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? api.updateProduct(editing.id, data) : api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editing ? 'Produto atualizado!' : 'Produto criado!');
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setStep(1);
    setForm({ 
      name: '', description: '', price: '', promoPrice: '', 
      stock: '0', availableDays: ['seg','ter','qua','qui','sex','sab','dom'], 
      categoryId: '', optionGroupsIds: [] 
    });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setStep(1);
    setForm({ 
      name: p.name, 
      description: p.description || '', 
      price: String(p.price), 
      promoPrice: p.promoPrice ? String(p.promoPrice) : '',
      stock: String(p.stock || 0),
      availableDays: p.availableDays ? p.availableDays.split(',') : ['seg','ter','qua','qui','sex','sab','dom'],
      categoryId: p.categoryId || '',
      optionGroupsIds: p.optionGroups?.map((g: any) => g.id) || []
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) return; // Evita envio acidental no passo 1

    createMutation.mutate({ 
      ...form,
      price: Number(form.price),
      promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
      stock: Number(form.stock),
      availableDays: form.availableDays.join(',')
    });
  };

  const toggleDay = (dayId: string) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(dayId) 
        ? f.availableDays.filter(d => d !== dayId) 
        : [...f.availableDays, dayId]
    }));
  };

  return (
    <div className="space-y-6 animate-slide-up p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Cardápio</h2>
        <Button onClick={openCreate} className="rounded-xl font-bold uppercase text-xs shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-[2rem] border-none">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-primary border-primary bg-primary/5">
                PASSO {step} DE 2
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-black uppercase italic text-gray-900">
              {step === 1 ? 'Dados do Produto' : 'Personalização'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {step === 1 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] font-black uppercase ml-1 text-gray-400">Nome do Item</Label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Pizza Calabresa G" className="rounded-xl h-11" required />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] font-black uppercase ml-1 text-gray-400">Categoria</Label>
                    <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{categories?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase ml-1 text-gray-400">Preço Normal</Label>
                    <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="R$ 0,00" className="rounded-xl h-11" required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase ml-1 text-green-600">Preço Promoção</Label>
                    <Input type="number" step="0.01" value={form.promoPrice} onChange={e => setForm(f => ({ ...f, promoPrice: e.target.value }))} placeholder="R$ 0,00" className="rounded-xl h-11 border-green-100 bg-green-50/30 focus-visible:ring-green-500" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] font-black uppercase ml-1 text-gray-400">Estoque Inicial</Label>
                    <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="rounded-xl h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase ml-1 text-gray-400">Disponível em quais dias?</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                          form.availableDays.includes(day.id) 
                          ? 'bg-primary text-white border-primary shadow-md' 
                          : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vincular Grupos Existentes</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-hide">
                    {optionGroups?.map((group: any) => (
                      <label key={group.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-primary/50 cursor-pointer transition-all shadow-sm">
                        <span className="text-sm font-bold text-gray-700">{group.name}</span>
                        <Checkbox 
                          checked={form.optionGroupsIds.includes(group.id)}
                          onCheckedChange={() => setForm(f => ({
                            ...f,
                            optionGroupsIds: f.optionGroupsIds.includes(group.id) 
                              ? f.optionGroupsIds.filter(id => id !== group.id)
                              : [...f.optionGroupsIds, group.id]
                          }))}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed border-gray-200" /></div>
                  <div className="relative flex justify-center text-[9px] uppercase font-black text-gray-300">
                    <span className="bg-white px-3">Ou crie um novo grupo abaixo</span>
                  </div>
                </div>

                <div className="bg-primary/5 p-5 rounded-[2rem] border border-primary/10 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[9px] font-black uppercase ml-1 text-primary/60">Nome</Label>
                      <Input id="quick-group-name" placeholder="Ex: Adicionais" className="h-9 rounded-xl text-xs bg-white border-primary/20" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase ml-1 text-primary/60">Min</Label>
                      <Input id="quick-group-min" type="number" defaultValue="0" className="h-9 rounded-xl text-xs bg-white border-primary/20" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase ml-1 text-primary/60">Max</Label>
                      <Input id="quick-group-max" type="number" defaultValue="1" className="h-9 rounded-xl text-xs bg-white border-primary/20" />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-10 rounded-xl border-dashed border-primary/40 text-primary font-black text-[10px] uppercase hover:bg-primary hover:text-white transition-all shadow-sm"
                    onClick={async () => {
                      const nameInput = document.getElementById('quick-group-name') as HTMLInputElement;
                      const minInput = document.getElementById('quick-group-min') as HTMLInputElement;
                      const maxInput = document.getElementById('quick-group-max') as HTMLInputElement;
                      
                      if (!nameInput.value) return toast.error("Dê um nome ao grupo");

                      try {
                        const newGroup = await api.createOptionGroup({ 
                          name: nameInput.value, 
                          minOptions: Number(minInput.value), 
                          maxOptions: Number(maxInput.value), 
                          options: [] 
                        });
                        queryClient.invalidateQueries({ queryKey: ['option-groups'] });
                        setForm(f => ({ ...f, optionGroupsIds: [...f.optionGroupsIds, newGroup.id] }));
                        toast.success("Grupo criado e vinculado!");
                        nameInput.value = "";
                      } catch (err) {
                        toast.error("Erro ao criar grupo rápido");
                      }
                    }}
                  >
                    <Plus className="h-3 w-3 mr-2" /> Criar e Vincular Agora
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="bg-gray-50/80 p-6 pt-4 flex flex-row gap-3">
              {step === 2 && (
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="rounded-xl font-bold uppercase text-[10px] h-12 px-6">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              )}
              {step === 1 ? (
                <Button 
                  type="button" // CRUCIAL: Impede o submit precoce
                  onClick={() => setStep(2)} 
                  className="w-full h-12 rounded-xl font-black uppercase italic tracking-widest shadow-lg shadow-primary/20"
                >
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending} 
                  className="w-full h-12 rounded-xl font-black uppercase italic tracking-widest shadow-lg shadow-primary/20"
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin" /> : 'Finalizar e Salvar'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map(product => (
          <Card key={product.id} className="rounded-[2rem] border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group bg-white">
            <div className="relative h-44 bg-gray-100">
              {product.imageUrl ? (
                <img src={product.imageUrl} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300"><ImageIcon className="h-10 w-10" /></div>
              )}
              <div className="absolute top-4 right-4">
                <Badge className={product.isActive ? 'bg-green-500 text-white border-none' : 'bg-gray-400 text-white border-none'}>
                  {product.isActive ? 'ATIVO' : 'PAUSADO'}
                </Badge>
              </div>
              {product.promoPrice && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full italic tracking-tighter shadow-xl">OFERTA</div>
              )}
            </div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                  <div className="flex gap-2 items-center">
                    {product.promoPrice ? (
                      <>
                        <span className="text-xl font-black text-primary italic">R${product.promoPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400 line-through font-bold">R${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-xl font-black text-primary italic">R${product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-widest pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md text-gray-500">📦 {product.stock} em estoque</div>
                <div className="truncate max-w-[150px]">{product.availableDays?.toUpperCase() || 'TODOS OS DIAS'}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}