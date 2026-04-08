import { Store, Clock, MapPin } from 'lucide-react';

interface MenuHeaderProps {
  storeName: string;
  niche: string;
  phone?: string;
}

export default function MenuHeader({ storeName, niche, phone }: MenuHeaderProps) {
  return (
    <div className="gradient-primary px-4 pt-10 pb-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
          <Store className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground">{storeName}</h1>
        <p className="text-primary-foreground/80 mt-1 capitalize text-sm">{niche}</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-primary-foreground/70 text-xs">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Aberto agora
          </span>
          {phone && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Delivery
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
