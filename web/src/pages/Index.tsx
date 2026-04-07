import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { apiService } from "@/services/api";
import MenuHeader from "@/components/menu/MenuHeader";
import CategoryTabs from "@/components/menu/CategoryTabs";
import MenuItemCard from "@/components/menu/MenuItemCard";
import CartDrawer from "@/components/menu/CartDrawer";
import FloatingCartButton from "@/components/menu/FloatingCartButton";

const Index = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cart = useCart();

  // 1. Busca os dados reais do seu Backend em Piripiri
  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      try {
        const data = await apiService.getMenu(slug);
        setStore(data);
        if (data.categories?.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar cardápio:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // 2. Filtro de busca inteligente (Busca nos produtos vindos do banco)
  const filteredCategories = search && store
    ? store.categories
        .map((cat: any) => ({
          ...cat,
          products: cat.products.filter(
            (item: any) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((cat: any) => cat.products.length > 0)
    : store?.categories || [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return <div className="p-10 text-center">Estabelecimento não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header com dados reais do Banco */}
      <MenuHeader 
        businessName={store.name} 
        subtitle={store.description} 
        heroImage={store.logoUrl} 
      />

      {/* Search */}
      <div className="mx-auto max-w-2xl px-4 -mt-6 relative z-10">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no cardápio..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!search && store.categories && (
        <CategoryTabs 
          categories={store.categories} 
          activeId={activeCategory} 
          onSelect={scrollToCategory} 
        />
      )}

      {/* Menu Items */}
      <main className="mx-auto max-w-2xl px-4 pt-6">
        {filteredCategories.map((cat: any) => (
          <section
            key={cat.id}
            ref={(el: HTMLDivElement | null) => { sectionRefs.current[cat.id] = el; }}
            className="mb-8 scroll-mt-20"
          >
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
              {cat.name}
            </h2>
            <div className="space-y-3">
              {cat.products?.map((item: any, i: number) => (
                <MenuItemCard 
                   key={item.id} 
                   item={item} 
                   onAdd={cart.addItem} 
                   index={i} 
                   currency="R$"
                />
              ))}
            </div>
          </section>
        ))}

        {filteredCategories.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg">Nenhum item encontrado</p>
            <p className="text-sm">Tente buscar por outro termo</p>
          </div>
        )}
      </main>

      <FloatingCartButton
        totalItems={cart.totalItems}
        total={cart.total}
        onClick={() => cart.setIsOpen(true)}
        currency="R$"
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
        whatsappNumber={store.phone}
        currency="R$"
      />
    </div>
  );
};

export default Index;