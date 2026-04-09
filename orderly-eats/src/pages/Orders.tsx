import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api, type OrderStatus } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, ShoppingBag, Clock, CheckCircle2, Truck, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

const statusMap: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  PREPARING: { label: 'Preparando', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Loader2 },
  SHIPPED: { label: 'Em Rota', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function Orders() {
  const [date, setDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();

  // Busca os pedidos filtrados pela data selecionada formatada para o backend
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', format(date, 'yyyy-MM-dd')],
    queryFn: () => api.getOrders(format(date, 'yyyy-MM-dd')),
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

  // Garante que orders seja um array antes de mapear
  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <p className="text-sm text-muted-foreground">Gerencie as vendas da sua loja</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Popover com Calendário para selecionar o dia */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2 min-w-[140px] justify-start font-normal">
                <CalendarIcon className="h-4 w-4 opacity-70" />
                {format(date, "dd 'de' MMMM", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Badge variant="secondary" className="h-10 px-4">
            {ordersList.length} pedidos
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Carregando pedidos...</p>
        </div>
      ) : ordersList.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium">Nenhum pedido neste dia</h3>
          <p className="text-sm text-muted-foreground">Tente selecionar outra data no calendário.</p>
        </div>
      ) : (
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
                      {/* Formata a data para o horário local do navegador */}
                      {format(new Date(order.createdAt), "HH:mm'h' - dd/MM/yyyy", { locale: ptBR })}
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
                        {order.items?.length > 0 ? (
                          order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between text-xs">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="text-muted-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-muted-foreground italic">Detalhes dos itens indisponíveis</li>
                        )}
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
      )}
    </div>
  );
}