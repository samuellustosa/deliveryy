import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, DollarSign, TrendingUp, Copy, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => api.getProducts() });
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: () => api.getOrders() });
  
  // Buscamos os dados da loja. O token agora já traz o storeId no 'sub'
  const { data: stores, isLoading: isLoadingStore } = useQuery({ 
    queryKey: ['stores'], 
    queryFn: () => api.getStores() 
  });
  
  const store = stores?.[0];

  // Cálculo de estatísticas
  const stats = [
    { label: 'Produtos', value: products?.length ?? 0, icon: Package, color: 'text-primary' },
    { label: 'Pedidos', value: orders?.length ?? 0, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Receita Total', value: `R$ ${(orders?.reduce((s, o) => s + o.total, 0) ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Pendentes', value: orders?.filter(o => o.status === 'PENDING').length ?? 0, icon: TrendingUp, color: 'text-yellow-500' },
  ];

  const handleCopyLink = () => {
    if (!store?.slug) return toast.error("Link do cardápio não disponível.");
    
    const baseUrl = window.location.origin;
    const menuLink = `${baseUrl}/m/${store.slug}`;
    
    navigator.clipboard.writeText(menuLink);
    toast.success('Link copiado! Já pode colar no status do WhatsApp.');
  };

  if (isLoadingStore) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando dados da sua loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Olá, {store?.name || 'Lojista'}! 👋</h2>
          <p className="text-sm text-muted-foreground font-medium">Aqui está o resumo do seu delivery hoje.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Rota corrigida para /dashboard/banners conforme seu App.tsx */}
          <Button variant="outline" size="sm" asChild className="rounded-xl font-bold shadow-sm">
            <Link to="/dashboard/banners">
              <ImageIcon className="mr-2 h-4 w-4" />
              Banners
            </Link>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyLink}
            disabled={!store}
            className="rounded-xl font-bold shadow-sm"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar Link
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            asChild
            disabled={!store}
            className="rounded-xl font-bold shadow-md shadow-primary/20"
          >
            <a href={`/m/${store?.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver Cardápio
            </a>
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</CardTitle>
              <div className={`p-2 rounded-xl bg-gray-50`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black tracking-tighter">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Card de Divulgação */}
      {store && (
        <Card className="bg-primary/5 border-none rounded-[2rem] overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-1">
              <p className="text-lg font-bold text-primary">Seu cardápio está pronto para vender!</p>
              <p className="text-sm text-muted-foreground">Compartilhe o link abaixo para começar a receber pedidos.</p>
            </div>
            <div className="flex items-center gap-2 bg-white p-2 pl-4 rounded-2xl border shadow-sm w-full sm:w-auto">
              <code className="text-xs font-mono font-bold text-primary truncate">
                {window.location.origin}/m/{store.slug}
              </code>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}