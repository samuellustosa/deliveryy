import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Order, type OrderStatus } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Clock, ChefHat, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; icon: any; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendente', icon: Clock, variant: 'outline' },
  PREPARING: { label: 'Preparando', icon: ChefHat, variant: 'default' },
  SHIPPED: { label: 'Enviado', icon: Truck, variant: 'secondary' },
  DELIVERED: { label: 'Entregue', icon: CheckCircle2, variant: 'default' },
  CANCELLED: { label: 'Cancelado', icon: XCircle, variant: 'destructive' },
};

const statusOrder: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Orders() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
    refetchInterval: 15000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status atualizado!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const sorted = [...(orders || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-2xl font-bold">Pedidos</h2>
      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Nenhum pedido ainda</p>
      ) : (
        <div className="space-y-4">
          {sorted.map(order => {
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.icon;
            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">#{order.id.slice(0, 8)}</CardTitle>
                      <Badge variant={cfg.variant}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Cliente:</span> {order.customerName}</div>
                    <div><span className="text-muted-foreground">Telefone:</span> {order.customerPhone}</div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground">Endereço:</span> {order.address}</div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Itens:</p>
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-muted-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm text-muted-foreground">Alterar status:</span>
                    <Select value={order.status} onValueChange={(v: OrderStatus) => updateMutation.mutate({ id: order.id, status: v })}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOrder.map(s => (
                          <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
