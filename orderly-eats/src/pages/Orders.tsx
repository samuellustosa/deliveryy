import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type OrderStatus } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShoppingBag, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const statusMap: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  PREPARING: { label: 'Preparando', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Loader2 },
  SHIPPED: { label: 'Em Rota', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function Orders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => 
      api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando pedidos...</p>
      </div>
    );
  }

  // CORREÇÃO: Garante que orders seja um array antes de mapear
  const ordersList = Array.isArray(orders) ? orders : [];

  if (ordersList.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium">Nenhum pedido ainda</h3>
        <p className="text-sm text-muted-foreground">Os pedidos dos seus clientes aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <Badge variant="outline">{ordersList.length} total</Badge>
      </div>

      <div className="grid gap-4">
        {ordersList.map((order) => {
          const status = statusMap[order.status];
          const StatusIcon = status.icon;

          return (
            <Card key={order.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: 'currentColor' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/10">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-bold">
                    Pedido #{order.id.slice(-4).toUpperCase()}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge className={`${status.color} border flex gap-1 items-center px-3 py-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold flex items-center gap-2">🛒 Itens</p>
                    <ul className="space-y-1 bg-muted/30 p-2 rounded-md">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-xs">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-muted-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold flex items-center gap-2">👤 Cliente</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Nome:</strong> {order.customerName}</p>
                      <p><strong>WhatsApp:</strong> {order.customerPhone}</p>
                      <p><strong>Endereço:</strong> {order.address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-lg font-bold text-primary">
                    Total: R$ {order.total.toFixed(2)}
                  </p>
                  
                  <Select
                    value={order.status}
                    onValueChange={(value: OrderStatus) => 
                      updateStatusMutation.mutate({ id: order.id, status: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Mudar status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}