import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Store as StoreIcon, Utensils, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { api } from "@/services/api"; // Usando a instância centralizada
import MenuHeader from "@/components/menu/MenuHeader";
import MenuItemCard from "@/components/menu/MenuItemCard";
import CartDrawer from "@/components/menu/CartDrawer";
import FloatingCartButton from "@/components/menu/FloatingCartButton";
import { Button } from "@/components/ui/button";

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cart = useCart();

  useEffect(() => {
    const loadMenu = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(false);
        
        // Chamada direta para o backend Fastify
        const response = await api.get(`/stores/${slug}/menu`);
        setStore(response.data);
      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, [slug]);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="text-muted-foreground animate-pulse font-medium">Buscando cardápio...</p>
    </div>
  );

  if (error || !store) return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="bg-muted p-6 rounded-full mb-6">
        <StoreIcon className="h-16 w-16 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Loja não encontrada</h1>
      <p className="text-muted-foreground mt-2 max-w-xs">
        O link que você acessou pode estar incorreto ou a loja mudou de endereço.
      </p>
      <Button className="mt-8 gap-2 px-8" onClick={() => navigate('/')}>
        Voltar para o início
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header com dados do banco: name, description e logoUrl */}
      <MenuHeader 
        businessName={store.name} 
        subtitle={store.description} 
        heroImage={store.logoUrl || "/placeholder-hero.png"} 
      />

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {store.categories?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Utensils className="h-12 w-12 mb-4 opacity-20" />
            <p>Nenhum item disponível no momento.</p>
          </div>
        ) : (
          store.categories?.map((cat: any) => (
            <section key={cat.id} className="mb-10">
              <h2 className="mb-5 text-xl font-bold flex items-center gap-2 text-foreground/90">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                {cat.name}
              </h2>
              <div className="grid gap-3">
                {cat.products?.map((product: any, i: number) => (
                  <MenuItemCard 
                    key={product.id} 
                    item={product} 
                    onAdd={cart.addItem} 
                    index={i}
                    currency="R$" 
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Botão flutuante só aparece se houver itens no carrinho */}
      {cart.totalItems > 0 && (
        <FloatingCartButton 
          totalItems={cart.totalItems} 
          total={cart.total} 
          onClick={() => cart.setIsOpen(true)} 
        />
      )}

      {/* Drawer para finalização do pedido */}
      <CartDrawer 
        open={cart.isOpen} 
        onOpenChange={cart.setIsOpen} 
        items={cart.items} 
        total={cart.total} 
        onAdd={cart.addItem} 
        onRemove={cart.removeItem} 
        onClear={cart.clearCart} 
        businessName={store.name} 
        currency="R$" 
        whatsappNumber={store.phone} // Enviará o pedido para o telefone salvo no banco
      />

      {/* Identificação do Sistema (Opcional - Estilo Samuel Lustosa) */}
      <div className="flex items-center justify-center gap-2 py-8 opacity-40">
        <AlertCircle className="h-3 w-3" />
        <span className="text-[10px] uppercase font-bold tracking-widest">
          Powered by Deliveryy CPD
        </span>
      </div>
    </div>
  );
}