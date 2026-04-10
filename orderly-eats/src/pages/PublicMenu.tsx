import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type Product } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Store, ShoppingBag, MapPin, Clock } from 'lucide-react';
import { formatPhoneNumber, formatCurrency } from '@/utils/format'; 

import { Badge } from '@/components/ui/badge';
import PromoBanner from '@/components/menu/PromoBanner';
import CategoryNav from '@/components/menu/CategoryNav';
import SearchBar from '@/components/menu/SearchBar';
import ProductCard from '@/components/menu/ProductCard';
import CartSheet from '@/components/menu/CartSheet';

// IMAGENS FIXAS E CORES DEFINIDAS POR VOCÊ (O LOJISTA NÃO MUDA ISSO)
const NICHE_THEMES: Record<string, any> = {
  acaiteria: {
    primary: "bg-purple-700",
    primaryText: "text-purple-700",
    bgLight: "bg-purple-50",
    // Banner Fixo para Açaí
    banner: "https://images.unsplash.com/photo-1594910411242-4589d8939626?q=80&w=1200&auto=format",
    gradient: "from-purple-900/90"
  },
  pizzaria: {
    primary: "bg-red-600",
    primaryText: "text-red-600",
    bgLight: "bg-red-50",
    // Banner Fixo para Pizza
    banner: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format",
    gradient: "from-red-900/90"
  },
  gastronomia: {
    primary: "bg-orange-500",
    primaryText: "text-orange-500",
    bgLight: "bg-orange-50",
    // Banner Fixo para Geral
    banner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format",
    gradient: "from-orange-900/90"
  }
};

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

  const theme = useMemo(() => {
    return NICHE_THEMES[menu?.store?.niche || 'gastronomia'] || NICHE_THEMES.gastronomia;
  }, [menu?.store?.niche]);

  useEffect(() => {
    if (menu?.store?.deliveryFee !== undefined) {
      setDeliveryFee(menu.store.deliveryFee);
    }
  }, [menu?.store?.deliveryFee, setDeliveryFee]);

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

    return { grouped: g, categoryNames: Object.keys(g).sort() };
  }, [menu]);

  const filteredGrouped = useMemo(() => {
    const result: Record<string, Product[]> = {};
    const q = search.toLowerCase();
    for (const [cat, products] of Object.entries(grouped)) {
      if (activeCategory && cat !== activeCategory) continue;
      const filtered = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) : products;
      if (filtered.length > 0) result[cat] = filtered;
    }
    return result;
  }, [grouped, search, activeCategory]);

  const handleCategorySelect = (cat: string | null) => {
    setActiveCategory(cat);
    if (cat && sectionRefs.current[cat]) {
      const offset = 100; 
      window.scrollTo({
        top: sectionRefs.current[cat]!.offsetTop - offset,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-screen text-primary">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );

  if (error || !menu) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Store className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold uppercase tracking-tighter">Loja não encontrada</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <div className="max-w-[600px] mx-auto bg-white min-h-screen shadow-2xl relative border-x border-gray-100">
        
        {/* BANNER FIXO POR NICHO (O lojista não tem acesso a mudar isso) */}
        <div className="relative h-52 w-full">
          <img 
            src={theme.banner} 
            className="w-full h-full object-cover" 
            alt="Banner de Nicho"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} to-transparent opacity-80`} />
          
          {/* FOTO DE PERFIL (LOGO DA LOJA - Isso ele pode mudar) */}
          <div className="absolute -bottom-10 left-6">
            <div className="h-24 w-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white">
              <img 
                src={menu.store.logoUrl || `https://ui-avatars.com/api/?name=${menu.store.name}&background=random`} 
                className="w-full h-full object-cover"
                alt="Logo da Loja"
              />
            </div>
          </div>
        </div>

        {/* INFO DA LOJA */}
        <div className="pt-14 px-6 pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">
              {menu.store.name}
            </h1>
            <Badge className={`${theme.primary} text-white rounded-full border-none px-3`}>
              Aberto
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 30-45 min</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Piripiri - PI</span>
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed italic">"{menu.store.description}"</p>
        </div>

        {/* DESTAQUE DA TAXA (DINÂMICO PELO TEMA) */}
        <div className={`mx-6 mb-6 p-4 rounded-2xl ${theme.bgLight} border border-dashed ${theme.primary}/30 flex justify-between items-center`}>
           <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-tight ${theme.primaryText}`}>Taxa de Entrega</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Pagamento na entrega</span>
           </div>
           <span className={`text-base font-black ${theme.primaryText}`}>
             {menu.store.deliveryFee > 0 ? formatCurrency(menu.store.deliveryFee) : 'GRÁTIS'}
           </span>
        </div>

        {/* BANNERS PROMOCIONAIS (OS QUE ELE CADASTRA NO DASHBOARD) */}
        <div className="px-6 mb-6">
          <PromoBanner banners={menu.banners || []} />
        </div>

        {/* BUSCA E CATEGORIAS STICKY */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md pt-2 border-b">
          <div className="px-6">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <CategoryNav
            categories={categoryNames}
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        {/* PRODUTOS */}
        <div className="px-6 py-8 space-y-12">
          {Object.entries(filteredGrouped).map(([category, products]) => (
            <div
              key={category}
              ref={el => { sectionRefs.current[category] = el; }}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className={`h-4 w-1.5 rounded-full ${theme.primary}`} />
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                  {category}
                </h2>
                <span className="text-[10px] font-bold text-gray-300 ml-auto">{products.length} itens</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
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
          ))}
        </div>
      </div>
      
      <CartSheet storeId={menu.store.id} />
    </div>
  );
}