import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LayoutDashboard, ShoppingBag, DollarSign, Utensils } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

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
        
        // Buscamos pedidos e produtos em paralelo para ganhar performance
        const [ordersResponse, productsResponse] = await Promise.all([
          api.get("/orders"),
          api.get("/products")
        ]);

        const orders = ordersResponse.data;
        const products = productsResponse.data;

        // Calculamos o faturamento total somando o campo 'total' de cada pedido
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
          description: "Não conseguimos carregar os dados em tempo real."
        });
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Sincronizando dados...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
            <p className="text-muted-foreground">Visão geral do Samuel's Burger</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Card de Pedidos */}
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

        {/* Card de Faturamento */}
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

        {/* Card de Cardápio */}
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

      {/* Dica de Desenvolvedor */}
      <div className="mt-10 p-4 rounded-xl border bg-card text-center text-sm shadow-sm flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Sistema conectado: <span className="font-mono font-bold">api.delivery.v1</span>
      </div>
    </div>
  );
}