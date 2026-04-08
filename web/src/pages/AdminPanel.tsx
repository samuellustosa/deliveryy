import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Loader2, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface Product {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

export default function AdminPanel() {
  const { id: establishmentId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Busca produtos reais do seu Node.js
  async function fetchProducts() {
    try {
      setLoading(true);
      // Usando a rota que você definiu no backend para listar produtos
      const response = await api.get(`/products`); 
      setProducts(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Não foi possível buscar seus produtos."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [establishmentId]);

  // Alterna disponibilidade do produto (Sua rota patch-product-status)
  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/products/${productId}/status`, {
        isActive: !currentStatus
      });
      
      setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, isActive: !currentStatus } : p)
      );

      toast({ title: "Status atualizado!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao mudar status." });
    }
  };

  // Deleta o produto (Sua rota delete-product)
  const handleDeleteItem = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({ title: "Item removido com sucesso." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao excluir item." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando cardápio...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Cardápio</h1>
          <p className="text-muted-foreground">Adicione ou remova itens do seu menu público.</p>
        </div>
        <Button onClick={() => {/* Lógica para abrir modal de novo item */}} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Item
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-muted/20">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum item cadastrado</p>
          <p className="text-sm text-muted-foreground mb-6">Comece adicionando seu primeiro lanche!</p>
          <Button variant="outline">Criar Produto</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`p-5 border rounded-xl bg-card shadow-sm flex items-center justify-between transition-opacity ${!product.isActive && 'opacity-60'}`}
            >
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm font-medium text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-muted/50 px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {product.isActive ? 'Disponível' : 'Indisponível'}
                  </span>
                  <Switch 
                    checked={product.isActive} 
                    onCheckedChange={() => handleToggleStatus(product.id, product.isActive)}
                  />
                </div>

                <Button 
                  onClick={() => handleDeleteItem(product.id)}
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3 justify-center text-sm text-primary/80">
        <AlertCircle className="h-4 w-4" />
        Painel Administrativo
      </div>
    </div>
  );
}