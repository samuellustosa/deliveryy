import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, ShoppingBag, DollarSign, Utensils, PlusCircle 
} from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalOrders: number;
  revenue: number;
  productsCount: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    revenue: 0,
    productsCount: 0
  });
  
  const { toast } = useToast();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Chamadas ao seu backend Node.js
        const [ordersResponse, productsResponse] = await Promise.all([
          api.get("/orders"),
          api.get("/products")
        ]);

        const orders = ordersResponse.data;
        const products = productsResponse.data;
        
        // Faturamento calculado dinamicamente
        const totalRevenue = orders.reduce((acc: number, order: any) => acc + (order.total || 0), 0);

        setStats({
          totalOrders: orders.length,
          revenue: totalRevenue,
          productsCount: products.length
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar painel",
          description: "Não conseguimos carregar os dados do servidor."
        });
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Sincronizando com o banco Neon...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-muted-foreground">Visão geral da sua loja</p>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Pedidos Totais</CardTitle>
            <ShoppingBag className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Pedidos realizados até agora</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Faturamento</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Volume bruto de vendas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Itens no Menu</CardTitle>
            <Utensils className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.productsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Produtos ativos no cardápio</p>
          </CardContent>
        </Card>
      </div>

      {/* Status da Conexão */}
      <div className="p-4 rounded-xl border bg-card text-center text-sm shadow-sm flex items-center justify-center gap-2 max-w-fit mx-auto">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Sistema conectado: <span className="font-mono font-bold">api.delivery.v1</span>
      </div>
    </div>
  );
}