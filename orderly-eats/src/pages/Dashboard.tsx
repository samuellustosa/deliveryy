import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, DollarSign, TrendingUp, Copy, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom'; // Importante para navegação interna

export default function Dashboard() {
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => api.getProducts() });
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: () => api.getOrders() });
  
  const { data: stores } = useQuery({ queryKey: ['stores'], queryFn: () => api.getStores() });
  const store = stores?.[0];

  const stats = [
    { label: 'Produtos', value: products?.length ?? 0, icon: Package, color: 'text-primary' },
    { label: 'Pedidos', value: orders?.length ?? 0, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Receita Total', value: `R$ ${(orders?.reduce((s, o) => s + o.total, 0) ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Pendentes', value: orders?.filter(o => o.status === 'PENDING').length ?? 0, icon: TrendingUp, color: 'text-yellow-500' },
  ];

  const handleCopyLink = () => {
    if (!store?.slug) return toast.error("Slug da loja não encontrado");
    
    const baseUrl = window.location.origin;
    const menuLink = `${baseUrl}/m/${store.slug}`;
    
    navigator.clipboard.writeText(menuLink);
    toast.success('Link do cardápio copiado com sucesso!');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Visão geral</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* BOTÃO DE BANNERS ADICIONADO AQUI */}
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link to="/banners">
              <ImageIcon className="mr-2 h-4 w-4" />
              Banners
            </Link>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyLink}
            disabled={!store}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar Link
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            asChild
            disabled={!store}
          >
            <a href={`/m/${store?.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver Cardápio
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Card Informativo do Link */}
      {store && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium">Seu cardápio online está ativo!</p>
              <p className="text-xs text-muted-foreground">Compartilhe o link abaixo com seus clientes no WhatsApp.</p>
            </div>
            <code className="bg-background px-3 py-1 rounded border text-xs font-mono text-primary">
              {window.location.origin}/m/{store.slug}
            </code>
          </CardContent>
        </Card>
      )}
    </div>
  );
}