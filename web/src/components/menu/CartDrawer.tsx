import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { CartItem } from "@/hooks/useCart";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: CartItem[];
  total: number;
  onAdd: (item: CartItem) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  businessName?: string;
  currency?: string;
  whatsappNumber?: string;
}

export default function CartDrawer({ 
  open, 
  onOpenChange, 
  items, 
  total, 
  onAdd, 
  onRemove, 
  onClear, 
  businessName, 
  currency = "R$", 
  whatsappNumber 
}: Props) {
  
  const handleWhatsApp = () => {
    if (!whatsappNumber) return;

    // Formata a lista de produtos para o texto do WhatsApp
    const itemsList = items
      .map((i) => `${i.quantity}x ${i.name} - ${currency} ${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");

    const message = `*Pedido - ${businessName || "Novo Pedido"}*\n\n${itemsList}\n\n*Total: ${currency} ${total.toFixed(2)}*`;
    
    // Limpa o número (remove espaços e caracteres especiais) e abre o link
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingBag className="h-5 w-5" /> Seu Pedido
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 opacity-30" />
            <p>Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  {/* Ajustado para usar imageUrl que vem do Cloudinary via seu Back */}
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="h-14 w-14 rounded-md object-cover" 
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {currency} {item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => onAdd(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold font-display text-foreground">
                  {currency} {total.toFixed(2)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={onClear}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Limpar
                </button>
                
                <button
                  onClick={handleWhatsApp}
                  disabled={!whatsappNumber}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  Enviar Pedido via WhatsApp
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}