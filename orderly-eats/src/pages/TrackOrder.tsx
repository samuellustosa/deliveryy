import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, Package, Clock, CheckCircle2, Truck, XCircle, MessageCircle, Utensils } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const statusSteps = [
  { status: 'PENDING', label: 'Recebido', icon: Clock },
  { status: 'PREPARING', label: 'Preparando', icon: Utensils },
  { status: 'SHIPPED', label: 'Em rota', icon: Truck },
  { status: 'DELIVERED', label: 'Entregue', icon: CheckCircle2 },
];

const statusMap = {
  PENDING: { label: 'Aguardando confirmação', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  PREPARING: { label: 'O chef está preparando', color: 'text-blue-500', bg: 'bg-blue-50' },
  SHIPPED: { label: 'Saiu para entrega!', color: 'text-purple-500', bg: 'bg-purple-50' },
  DELIVERED: { label: 'Pedido entregue', color: 'text-green-500', bg: 'bg-green-50' },
  CANCELLED: { label: 'Pedido cancelado', color: 'text-red-500', bg: 'bg-red-50' },
};

export default function TrackOrder() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['track-order', id],
    queryFn: () => api.getOrder(id!),
    refetchInterval: 10000, 
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (error || !order) return <div className="p-10 text-center font-bold">Pedido não encontrado.</div>;

  const currentStatus = statusMap[order.status as keyof typeof statusMap] || statusMap.PENDING;
  
  // Lógica para calcular a largura da barra de progresso
  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);
  const progressWidth = order.status === 'CANCELLED' ? 0 : (currentStepIndex / (statusSteps.length - 1)) * 100;

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Olá! Gostaria de informações sobre o pedido #${order.id.slice(0, 8)}`);
    window.open(`https://wa.me/${order.store?.phone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans pb-20">
      <div className="max-w-[500px] mx-auto space-y-6">
        
        {/* Header de Status */}
        <div className={`p-8 rounded-[2rem] shadow-sm text-center border bg-white relative overflow-hidden`}>
          <div className={`absolute top-0 left-0 h-1 w-full ${currentStatus.bg.replace('bg-', 'bg-')}`} />
          <h1 className={`text-2xl font-black tracking-tight ${currentStatus.color}`}>{currentStatus.label}</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* BARRA DE PROGRESSO ESTILO MERCADO LIVRE */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="relative flex justify-between">
            {/* Linha de fundo */}
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0" />
            
            {/* Linha de progresso ativa */}
            <div 
              className="absolute top-5 left-0 h-1 bg-primary transition-all duration-1000 ease-in-out -z-0" 
              style={{ width: `${progressWidth}%` }}
            />

            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                    ${isCompleted ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-white border-2 border-gray-100 text-gray-300'}
                    ${isCurrent ? 'animate-pulse' : ''}
                  `}>
                    <step.icon size={20} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${isCompleted ? 'text-primary' : 'text-gray-300'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhes do Pedido */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-primary" /> Seu Pedido
          </h2>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  <span className="font-bold text-primary">{item.quantity}x</span> {item.product?.name}
                </span>
                <span className="font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de Entrega</span> 
              <span className="font-medium text-green-600">{order.deliveryFee === 0 ? 'Grátis' : formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-xl font-black pt-2">
              <span>Total</span> 
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Botão flutuante ou fixo para contato */}
        <Button 
          onClick={handleWhatsAppClick}
          className="w-full h-16 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold gap-3 shadow-xl shadow-green-100 border-none text-lg"
        >
          <MessageCircle size={24} /> 
          Dúvidas? Chame a gente
        </Button>
      </div>
    </div>
  );
}