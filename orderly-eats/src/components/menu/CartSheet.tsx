// orderly-eats/src/components/menu/CartSheet.tsx
import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, User, Send, Home, Store, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency, formatPhoneNumber } from '@/utils/format';

interface CartSheetProps {
  storeId: string;
}

export default function CartSheet({ storeId }: CartSheetProps) {
  const { items, removeItem, updateQuantity, clearCart, subtotal, deliveryFee, total, itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    orderType: 'DELIVERY',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    reference: '',
    city: '',
    state: ''
  });

  const handleZipCodeBlur = async () => {
    const cleanCep = orderForm.zipCode.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setOrderForm(prev => ({
            ...prev,
            street: data.logradouro,
            city: data.localidade,
            state: data.uf
          }));
          toast.success('Endereço localizado!');
        } else {
          toast.error('CEP não encontrado.');
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP.');
      }
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);

    const addressString = orderForm.orderType === 'DELIVERY' 
      ? `${orderForm.street}, ${orderForm.number}${orderForm.complement ? ` - ${orderForm.complement}` : ''} (${orderForm.reference || 'Sem referência'}), ${orderForm.city}/${orderForm.state}`
      : orderForm.orderType === 'PICKUP' ? 'Retirada no Local' : 'Consumo no Local';

    try {
      const response = await api.createOrder({
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone.replace(/\D/g, ''), 
        address: addressString,
        type: orderForm.orderType as 'DELIVERY' | 'PICKUP' | 'ONSITE',
        deliveryFee: orderForm.orderType === 'DELIVERY' ? deliveryFee : 0,
        zipCode: orderForm.orderType === 'DELIVERY' ? orderForm.zipCode : null,
        street: orderForm.orderType === 'DELIVERY' ? orderForm.street : null,
        number: orderForm.orderType === 'DELIVERY' ? orderForm.number : null,
        complement: orderForm.complement || null,
        reference: orderForm.reference || null,
        city: orderForm.orderType === 'DELIVERY' ? orderForm.city : null,
        state: orderForm.orderType === 'DELIVERY' ? orderForm.state : null,
        total: orderForm.orderType === 'DELIVERY' ? total : subtotal,
        storeId,
        items: items.map(i => ({ 
          productId: i.product.id, 
          quantity: i.quantity, 
          price: i.product.price,
          // Enviando as opções selecionadas para o backend
          options: i.selectedOptions 
        })),
      });
      
      toast.success('Pedido enviado com sucesso! 🎉');
      clearCart();
      setCheckoutOpen(false);
      setCartOpen(false);
      
      if (response && response.orderId) {
        window.location.href = `/track/${response.orderId}`;
      }

    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (itemCount === 0) return null;

  const currentTotal = orderForm.orderType === 'DELIVERY' ? total : subtotal;

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger asChild>
        <button className="fixed bottom-6 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground rounded-full py-3 px-6 shadow-xl z-50 flex items-center gap-3 hover:scale-105 transition-transform active:scale-95">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold text-sm">Ver carrinho</span>
          <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
          <span className="font-bold text-sm">{formatCurrency(currentTotal)}</span>
          <Badge variant="secondary" className="text-[10px] h-5 min-w-5 px-1 ml-1">{itemCount}</Badge>
        </button>
      </SheetTrigger>
      
      <SheetContent className="flex flex-col w-full sm:max-w-md overflow-hidden border-l-0 sm:border-l p-0">
        <div className="p-6 border-b bg-white">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl font-black">
              <ShoppingCart className="h-6 w-6 text-primary" /> Seu Pedido
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map((item, index) => (
            <div key={`${item.product.id}-${index}`} className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{item.product.name}</p>
                  
                  {/* EXIBIÇÃO DAS OPÇÕES SELECIONADAS (PIZZA/AÇAÍ) */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.selectedOptions.map((opt, i) => (
                        <span key={i} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600 font-medium">
                          + {opt.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs font-black text-primary">
                    {formatCurrency((item.product.price + (item.selectedOptions?.reduce((a, b) => a + b.price, 0) || 0)) * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-full border shadow-sm">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full" 
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedOptions)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full" 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedOptions)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-white space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {orderForm.orderType === 'DELIVERY' && (
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Entrega</span>
                <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                  {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2">
              <span className="text-sm font-black uppercase">Total</span>
              <span className="text-2xl font-black text-primary">{formatCurrency(currentTotal)}</span>
            </div>
          </div>

          {!checkoutOpen ? (
            <Button className="w-full h-12 rounded-2xl text-sm font-black uppercase italic tracking-widest shadow-lg shadow-primary/20" onClick={() => setCheckoutOpen(true)}>
              Continuar
            </Button>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-500 max-h-[400px] overflow-y-auto pr-1">
              <Separator />
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-gray-400 ml-1">Seu Nome</Label>
                  <Input value={orderForm.customerName} onChange={e => setOrderForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Como te chamamos?" className="rounded-xl h-11 border-gray-100 bg-gray-50 focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-gray-400 ml-1">WhatsApp</Label>
                  <Input value={orderForm.customerPhone} onChange={e => setOrderForm(f => ({ ...f, customerPhone: formatPhoneNumber(e.target.value) }))} placeholder="(86) 99999-9999" className="rounded-xl h-11 border-gray-100 bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black text-gray-400 ml-1">Como quer receber?</Label>
                <RadioGroup defaultValue="DELIVERY" onValueChange={v => setOrderForm(f => ({ ...f, orderType: v }))} className="flex gap-2">
                  {[
                    { id: 'del', val: 'DELIVERY', label: 'Entrega', icon: Home },
                    { id: 'pick', val: 'PICKUP', label: 'Retirada', icon: Store },
                    { id: 'on', val: 'ONSITE', label: 'No Local', icon: Utensils }
                  ].map(type => (
                    <div key={type.id} className="flex-1">
                      <RadioGroupItem value={type.val} id={type.id} className="peer sr-only" />
                      <Label htmlFor={type.id} className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 bg-white p-3 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                        <type.icon className={`h-4 w-4 mb-1 ${orderForm.orderType === type.val ? 'text-primary' : 'text-gray-400'}`} />
                        <span className="text-[9px] font-black uppercase">{type.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {orderForm.orderType === 'DELIVERY' && (
                <div className="space-y-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-in zoom-in-95 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-primary">CEP</Label>
                      <Input value={orderForm.zipCode} onBlur={handleZipCodeBlur} onChange={e => setOrderForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="00000-000" className="h-10 text-xs rounded-xl border-primary/20" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-primary">Número</Label>
                      <Input value={orderForm.number} onChange={e => setOrderForm(f => ({ ...f, number: e.target.value }))} placeholder="Ex: 123" className="h-10 text-xs rounded-xl border-primary/20" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-primary">Rua</Label>
                    <Input value={orderForm.street} readOnly className="h-10 text-xs bg-white/50 rounded-xl" />
                  </div>
                </div>
              )}

              <Button
                className="w-full rounded-2xl h-14 text-md font-black uppercase italic tracking-widest shadow-xl"
                onClick={handleCheckout}
                disabled={submitting || !orderForm.customerName || orderForm.customerPhone.length < 10 || (orderForm.orderType === 'DELIVERY' && !orderForm.number)}
              >
                {submitting ? <Loader2 className="animate-spin h-6 w-6" /> : <><Send className="mr-2 h-5 w-5" /> Enviar Pedido</>}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}