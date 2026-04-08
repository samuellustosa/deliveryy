import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => api.getProducts() });
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: () => api.getOrders() });

  const stats = [
    { label: 'Produtos', value: products?.length ?? 0, icon: Package, color: 'text-primary' },
    { label: 'Pedidos', value: orders?.length ?? 0, icon: ShoppingBag, color: 'text-info' },
    { label: 'Receita Total', value: `R$ ${(orders?.reduce((s, o) => s + o.total, 0) ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-success' },
    { label: 'Pendentes', value: orders?.filter(o => o.status === 'PENDING').length ?? 0, icon: TrendingUp, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-2xl font-bold">Visão geral</h2>
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
    </div>
  );
}
