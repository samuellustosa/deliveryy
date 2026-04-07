import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Store as StoreIcon } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { apiService } from "@/services/api";
import MenuHeader from "@/components/menu/MenuHeader";
import MenuItemCard from "@/components/menu/MenuItemCard";
import CartDrawer from "@/components/menu/CartDrawer";
import FloatingCartButton from "@/components/menu/FloatingCartButton";
import { Button } from "@/components/ui/button";

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cart = useCart();

  useEffect(() => {
    const loadMenu = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // Chama a nossa API real que busca no banco Neon
        const data = await apiService.getMenu(slug);
        setStore(data);
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
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  if (error || !store) return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <StoreIcon className="h-12 w-12 mb-4 text-muted-foreground" />
      <h1 className="text-xl font-bold">Loja não encontrada</h1>
      <p className="text-muted-foreground">Verifique o endereço ou tente novamente.</p>
      <Button className="mt-4" onClick={() => window.location.href = '/'}>
        Voltar para o início
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Dados mapeados do schema.prisma: logoUrl e name */}
      <MenuHeader 
        businessName={store.name} 
        subtitle={store.description} 
        heroImage={store.logoUrl} 
      />

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {store.categories?.map((cat: any) => (
          <section key={cat.id} className="mb-10">
            <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
              {cat.name}
            </h2>
            <div className="grid gap-4">
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
        ))}
      </main>

      <FloatingCartButton 
        totalItems={cart.totalItems} 
        total={cart.total} 
        onClick={() => cart.setIsOpen(true)} 
      />

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
        whatsappNumber={store.phone} // Mapeado do campo 'phone' da Store
      />
    </div>
  );
}