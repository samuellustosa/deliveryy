import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Upload, Loader2, ImageIcon, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const queryClient = useQueryClient();

  // Estados para o formulário de Categoria
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Estados para o formulário de Produto
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '' });

  // 1. Busca de produtos
  const { data: products, isLoading: loadingProducts } = useQuery({ 
    queryKey: ['products'], 
    queryFn: () => api.getProducts() 
  });

  // 2. Busca de categorias (Ajustado para usar a rota direta)
  const { data: categories, isLoading: loadingCategories } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: () => api.getCategories() 
  });

  // Mutation para criar Categoria
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => api.createCategory({ name }),
    onSuccess: () => {
      // Invalida 'categories' para forçar o Select a atualizar imediatamente
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      toast.success('Categoria criada com sucesso!');
      setCategoryDialogOpen(false);
      setNewCategoryName('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao criar categoria');
    },
  });

  // Mutation para criar/editar Produto
  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? api.updateProduct(editing.id, data) : api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editing ? 'Produto atualizado!' : 'Produto criado!');
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao processar produto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto removido!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.toggleProductStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (err: any) => toast.error(err.message),
  });

  const imageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => api.uploadProductImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Imagem atualizada!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', categoryId: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ 
      name: p.name, 
      description: p.description || '', 
      price: String(p.price), 
      categoryId: p.categoryId || '' 
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) return toast.error("Selecione uma categoria.");
    
    createMutation.mutate({ 
      name: form.name, 
      description: form.description, 
      price: Number(form.price), 
      categoryId: form.categoryId 
    });
  };

  const handleImageUpload = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) imageMutation.mutate({ id: productId, file });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produtos</h2>
        
        <div className="flex gap-2">
          {/* DIALOG DE NOVA CATEGORIA */}
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" /> Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Nome da Categoria</Label>
                  <Input 
                    placeholder="Ex: Bebidas, Lanches..." 
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createCategoryMutation.mutate(newCategoryName)}
                  disabled={createCategoryMutation.isPending || !newCategoryName}
                >
                  {createCategoryMutation.isPending ? <Loader2 className="animate-spin" /> : 'Criar Categoria'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* DIALOG DE NOVO PRODUTO */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Novo produto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar produto' : 'Novo produto'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={form.categoryId} 
                    onValueChange={value => setForm(f => ({ ...f, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Carregando..." : "Selecione uma categoria"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Nenhuma categoria encontrada.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    value={form.description} 
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={form.price} 
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                    required 
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    editing ? 'Salvar Alterações' : 'Criar Produto'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loadingProducts ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-40 bg-muted flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                )}
                <label className="absolute bottom-2 right-2 cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => handleImageUpload(product.id, e)} 
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md hover:bg-accent transition-colors">
                    <Upload className="h-4 w-4 text-foreground" />
                  </div>
                </label>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="max-w-[70%]">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-primary">
                  R$ {product.price.toFixed(2)}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={isActive => toggleMutation.mutate({ id: product.id, isActive })}
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.isActive ? 'Visível' : 'Oculto'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (confirm("Deseja realmente excluir este produto?")) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}