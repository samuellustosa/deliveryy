import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type Product } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Store, ShoppingBag } from 'lucide-react';
// Importação dos utilitários de formatação
import { formatPhoneNumber, formatCurrency } from '@/utils/format'; 

import { Badge } from '@/components/ui/badge';
import MenuHeader from '@/components/menu/MenuHeader';
import PromoBanner from '@/components/menu/PromoBanner';
import CategoryNav from '@/components/menu/CategoryNav';
import SearchBar from '@/components/menu/SearchBar';
import ProductCard from '@/components/menu/ProductCard';
import CartSheet from '@/components/menu/CartSheet';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const { items, addItem, updateQuantity, setDeliveryFee } = useCart(); 
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: menu, isLoading, error } = useQuery({
    queryKey: ['menu', slug],
    queryFn: () => api.getMenu(slug!),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  // Atualiza a taxa de entrega quando o menu carrega
  useEffect(() => {
    if (menu?.store?.deliveryFee !== undefined) {
      setDeliveryFee(menu.store.deliveryFee);
    }
  }, [menu?.store?.deliveryFee, setDeliveryFee]);

  // Reseta filtros ao mudar de loja
  useEffect(() => {
    setSearch('');
    setActiveCategory(null);
  }, [slug]);

  const getItemQuantity = (productId: string) =>
    items.find(i => i.product.id === productId)?.quantity || 0;

  const { grouped, categoryNames } = useMemo(() => {
    if (!menu) return { grouped: {} as Record<string, Product[]>, categoryNames: [] as string[] };
    
    const categories = menu.categories || [];
    const allProducts = menu.products || [];
    const g: Record<string, Product[]> = {};

    allProducts.filter(p => p.isActive).forEach(p => {
      const categoryObj = categories.find(c => c.id === p.categoryId);
      const catName = categoryObj ? categoryObj.name : 'Outros';

      if (!g[catName]) g[catName] = [];
      g[catName].push(p);
    });

    const sortedNames = Object.keys(g).sort((a, b) => {
      if (a === 'Outros') return 1;
      if (b === 'Outros') return -1;
      return a.localeCompare(b);
    });

    return { grouped: g, categoryNames: sortedNames };
  }, [menu]);

  const filteredGrouped = useMemo(() => {
    const result: Record<string, Product[]> = {};
    const q = search.toLowerCase();

    for (const [cat, products] of Object.entries(grouped)) {
      if (activeCategory && cat !== activeCategory) continue;

      const filtered = q
        ? products.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.description?.toLowerCase().includes(q)
          )
        : products;

      if (filtered.length > 0) result[cat] = filtered;
    }
    return result;
  }, [grouped, search, activeCategory]);

  const handleCategorySelect = (cat: string | null) => {
    setActiveCategory(cat);
    if (cat && sectionRefs.current[cat]) {
      const offset = 140; 
      const element = sectionRefs.current[cat];
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3 text-primary font-sans">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando cardápio...</p>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 font-sans">
        <Store className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Loja não encontrada</h1>
        <p className="text-muted-foreground mt-2">Verifique o link ou tente novamente mais tarde.</p>
      </div>
    );
  }

  const totalFilteredProducts = Object.values(filteredGrouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <div className="max-w-[600px] mx-auto bg-white min-h-screen shadow-xl relative border-x border-gray-100">
        <MenuHeader 
          storeName={menu.store.name} 
          niche={menu.store.niche} 
          phone={formatPhoneNumber(menu.store.phone)} 
        />
        <div className="relative">
          <PromoBanner banners={menu.banners || []} />
        </div>
        
        <div className="px-4 py-2 bg-primary/5 flex justify-between items-center border-b border-primary/10">
           <span className="text-xs font-medium text-primary uppercase tracking-wider">Entrega</span>
           <span className="text-sm font-bold text-primary">
             {menu.store.deliveryFee > 0 ? formatCurrency(menu.store.deliveryFee) : 'Grátis'}
           </span>
        </div>

        <div className="px-4 mt-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b mt-2 shadow-sm">
          <CategoryNav
            categories={categoryNames}
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        <div className="px-4 py-6 space-y-10">
          {totalFilteredProducts === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-10" />
              <p>Nenhum produto encontrado nesta busca.</p>
            </div>
          ) : (
            Object.entries(filteredGrouped).map(([category, products]) => (
              <div
                key={category}
                ref={el => { sectionRefs.current[category] = el; }}
                className="scroll-mt-36"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-primary rounded-full shadow-sm" />
                  <h2 className="text-lg font-extrabold text-gray-800 tracking-tight capitalize">
                    {category}
                  </h2>
                  <Badge variant="secondary" className="rounded-full px-2 py-0 font-bold bg-gray-100 text-gray-600 border-none">
                    {products.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={getItemQuantity(product.id)}
                      onAdd={() => addItem(product, menu.store.id)} 
                      onUpdateQty={(qty) => updateQuantity(product.id, qty)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <CartSheet storeId={menu.store.id} />
    </div>
  );
}