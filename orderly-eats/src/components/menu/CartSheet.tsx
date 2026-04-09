import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, MapPin, Phone, User, Send, Home, Store, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

  // Estado detalhado do formulário
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    orderType: 'DELIVERY', // DELIVERY, PICKUP, ONSITE
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    reference: '',
    city: '',
    state: ''
  });

  // Função para buscar CEP automaticamente
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
          toast.success('Endereço preenchido!');
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

    const fullAddress = orderForm.orderType === 'DELIVERY' 
      ? `${orderForm.street}, ${orderForm.number} - ${orderForm.complement} (${orderForm.reference}), ${orderForm.city}/${orderForm.state}`
      : orderForm.orderType === 'PICKUP' ? 'Retirada no Local' : 'Consumo no Local';

    try {
      await api.createOrder({
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone.replace(/\D/g, ''), 
        address: fullAddress,
        total: orderForm.orderType === 'DELIVERY' ? total : subtotal,
        storeId,
        items: items.map(i => ({ 
          productId: i.product.id, 
          quantity: i.quantity, 
          price: i.product.price 
        })),
      });
      
      toast.success('Pedido enviado com sucesso! 🎉');
      clearCart();
      setCheckoutOpen(false);
      setCartOpen(false);
      setOrderForm({
        customerName: '', customerPhone: '', orderType: 'DELIVERY',
        zipCode: '', street: '', number: '', complement: '', reference: '', city: '', state: ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (itemCount === 0) return null;

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger asChild>
        <button className="fixed bottom-6 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground rounded-full py-3 px-6 shadow-xl z-50 flex items-center gap-3 hover:scale-105 transition-transform">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold text-sm">Ver carrinho</span>
          <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
          <span className="font-bold text-sm">{formatCurrency(orderForm.orderType === 'DELIVERY' ? total : subtotal)}</span>
          <Badge variant="secondary" className="text-xs ml-1">{itemCount}</Badge>
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Seu Pedido ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 py-4 space-y-2">
          {items.map(item => (
            <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(item.product.price)} cada</p>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="icon" variant="outline" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                <Button size="icon" variant="outline" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => removeItem(item.product.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {orderForm.orderType === 'DELIVERY' && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxa de entrega</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "text-accent font-medium"}>
                  {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
                </span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(orderForm.orderType === 'DELIVERY' ? total : subtotal)}</span>
            </div>
          </div>

          {!checkoutOpen ? (
            <Button className="w-full rounded-full" size="lg" onClick={() => setCheckoutOpen(true)}>
              Finalizar pedido
            </Button>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 pb-10">
              <Separator />
              <h3 className="font-bold text-sm flex items-center gap-2"><User className="h-4 w-4" /> Seus Dados</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome</Label>
                  <Input value={orderForm.customerName} onChange={e => setOrderForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Seu nome" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">WhatsApp</Label>
                  <Input value={orderForm.customerPhone} onChange={e => setOrderForm(f => ({ ...f, customerPhone: formatPhoneNumber(e.target.value) }))} placeholder="(86) 99999-9999" className="h-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">Como deseja receber?</Label>
                <RadioGroup defaultValue="DELIVERY" onValueChange={v => setOrderForm(f => ({ ...f, orderType: v }))} className="flex gap-2">
                  <div className="flex-1">
                    <RadioGroupItem value="DELIVERY" id="del" className="peer sr-only" />
                    <Label htmlFor="del" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer text-center">
                      <Home className="mb-1 h-4 w-4" /> <span className="text-[10px]">Entrega</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="PICKUP" id="pick" className="peer sr-only" />
                    <Label htmlFor="pick" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer text-center">
                      <Store className="mb-1 h-4 w-4" /> <span className="text-[10px]">Retirada</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="ONSITE" id="on" className="peer sr-only" />
                    <Label htmlFor="on" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer text-center">
                      <Utensils className="mb-1 h-4 w-4" /> <span className="text-[10px]">No Local</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {orderForm.orderType === 'DELIVERY' && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-xl">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold">CEP</Label>
                      <Input value={orderForm.zipCode} onBlur={handleZipCodeBlur} onChange={e => setOrderForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="00000-000" className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold">Nº</Label>
                      <Input value={orderForm.number} onChange={e => setOrderForm(f => ({ ...f, number: e.target.value }))} placeholder="123" className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">Rua</Label>
                    <Input value={orderForm.street} readOnly className="h-8 text-xs bg-muted" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold">Complemento</Label>
                      <Input value={orderForm.complement} onChange={e => setOrderForm(f => ({ ...f, complement: e.target.value }))} placeholder="Ap 01" className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold">Cidade</Label>
                      <Input value={orderForm.city} readOnly className="h-8 text-xs bg-muted" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold">Ponto de Referência</Label>
                    <Input value={orderForm.reference} onChange={e => setOrderForm(f => ({ ...f, reference: e.target.value }))} placeholder="Perto de..." className="h-8 text-xs" />
                  </div>
                </div>
              )}

              <Button
                className="w-full rounded-full"
                size="lg"
                onClick={handleCheckout}
                disabled={submitting || !orderForm.customerName || !orderForm.customerPhone || (orderForm.orderType === 'DELIVERY' && !orderForm.number)}
              >
                {submitting ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Enviar para WhatsApp</>}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}