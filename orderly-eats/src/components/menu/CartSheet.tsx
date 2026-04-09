import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, MapPin, Phone, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
//import { formatCurrency } from '@/lib/utils'; // Assumindo que você tem essa helper para formatar moeda

interface CartSheetProps {
  storeId: string;
}

export default function CartSheet({ storeId }: CartSheetProps) {
  // Atualizado para usar subtotal e deliveryFee do contexto
  const { items, removeItem, updateQuantity, clearCart, subtotal, deliveryFee, total, itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ customerName: '', customerPhone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      await api.createOrder({
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        address: orderForm.address,
        total, // Enviando o total completo (produtos + entrega)
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
      setOrderForm({ customerName: '', customerPhone: '', address: '' });
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
          <span className="font-bold text-sm">R$ {total.toFixed(2)}</span>
          <Badge variant="secondary" className="text-xs ml-1">{itemCount}</Badge>
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Seu Pedido ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {items.map(item => (
            <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">R$ {item.product.price.toFixed(2)} cada</p>
                <p className="text-sm font-bold text-primary mt-0.5">
                  R$ {(item.product.price * item.quantity).toFixed(2)}
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
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Taxa de entrega</span>
              <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "text-accent font-medium"}>
                {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {!checkoutOpen ? (
            <Button className="w-full rounded-full" size="lg" onClick={() => setCheckoutOpen(true)}>
              Finalizar pedido
            </Button>
          ) : (
            <div className="space-y-3 animate-in slide-in-from-bottom-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs"><User className="h-3 w-3" /> Nome</Label>
                <Input value={orderForm.customerName} onChange={e => setOrderForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Seu nome completo" className="rounded-full h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" /> WhatsApp</Label>
                <Input value={orderForm.customerPhone} onChange={e => setOrderForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="(11) 99999-9999" className="rounded-full h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs"><MapPin className="h-3 w-3" /> Endereço de entrega</Label>
                <Textarea value={orderForm.address} onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro, complemento..." className="rounded-xl" rows={2} />
              </div>
              <Button
                className="w-full rounded-full"
                size="lg"
                onClick={handleCheckout}
                disabled={submitting || !orderForm.customerName || !orderForm.customerPhone || !orderForm.address}
              >
                {submitting ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Enviar pedido</>}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}