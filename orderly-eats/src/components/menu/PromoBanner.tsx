import { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
}

interface PromoBannerProps {
  banners: Banner[];
}

export default function PromoBanner({ banners }: PromoBannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Se não houver banners cadastrados, o componente não renderiza nada
  if (!banners || banners.length === 0) return null;

  return (
    <div className="px-4 -mt-6 relative z-20">
      <div className="relative h-32 md:h-40 w-full overflow-hidden rounded-xl shadow-lg bg-muted">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={`Banner ${i + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <ImageIcon className="text-gray-400" />
              </div>
            )}
            
            {/* Overlay sutil para melhorar o contraste se houver texto na imagem */}
            <div className="absolute inset-0 bg-black/5" />
          </div>
        ))}

        {/* Indicadores (Dots) - Só aparecem se houver mais de um banner */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}