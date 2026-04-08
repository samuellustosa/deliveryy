import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type Product } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, ImageIcon, MapPin, Phone, User, Send, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ customerName: '', customerPhone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: menu, isLoading, error } = useQuery({
    queryKey: ['menu', slug],
    queryFn: () => api.getMenu(slug!),
    enabled: !!slug,
  });

  const handleCheckout = async () => {
    if (!menu || items.length === 0) return;
    setSubmitting(true);
    try {
      await api.createOrder({
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        address: orderForm.address,
        total,
        storeId: menu.store.id,
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
      });
      toast.success('Pedido enviado com sucesso!');
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error || !menu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <Store className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Loja não encontrada</h1>
        <p className="text-muted-foreground mt-2">Verifique o link e tente novamente.</p>
      </div>
    );
  }

  const getItemQuantity = (productId: string) => items.find(i => i.product.id === productId)?.quantity || 0;

  // Group products by category
  const categories = menu.categories || [];
  const grouped: Record<string, Product[]> = {};
  menu.products.forEach(p => {
    const cat = categories.find(c => c.id === p.categoryId)?.name || 'Outros';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-primary-foreground">{menu.store.name}</h1>
        <p className="text-primary-foreground/80 mt-1 capitalize">{menu.store.niche}</p>
      </div>

      {/* Products */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {Object.entries(grouped).map(([category, products]) => (
          <div key={category}>
            <h2 className="text-lg font-bold mb-3 text-foreground">{category}</h2>
            <div className="space-y-3">
              {products.map(product => {
                const qty = getItemQuantity(product.id);
                return (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-0 flex">
                      <div className="w-28 h-28 flex-shrink-0 bg-muted flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                          {qty === 0 ? (
                            <Button size="sm" onClick={() => addItem(product)}>
                              <Plus className="h-4 w-4 mr-1" /> Adicionar
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(product.id, qty - 1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-bold w-5 text-center">{qty}</span>
                              <Button size="icon" className="h-7 w-7" onClick={() => addItem(product)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cart FAB */}
      {itemCount > 0 && (
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <button className="fixed bottom-6 right-6 gradient-primary text-primary-foreground rounded-full p-4 shadow-lg z-50 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              <Badge variant="secondary" className="text-xs">{itemCount}</Badge>
            </button>
          </SheetTrigger>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Carrinho ({itemCount})</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">R$ {item.product.price.toFixed(2)} cada</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeItem(item.product.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
              {!checkoutOpen ? (
                <Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)}>
                  Finalizar pedido
                </Button>
              ) : (
                <div className="space-y-3 animate-slide-up">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><User className="h-3 w-3" /> Nome</Label>
                    <Input value={orderForm.customerName} onChange={e => setOrderForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> WhatsApp</Label>
                    <Input value={orderForm.customerPhone} onChange={e => setOrderForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Endereço</Label>
                    <Textarea value={orderForm.address} onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro..." />
                  </div>
                  <Button
                    className="w-full"
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
      )}
    </div>
  );
}
