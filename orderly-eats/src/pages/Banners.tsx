import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Loader2, Image as ImageIcon, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function Banners() {
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => api.getBanners(),
  });

  const createMutation = useMutation({
    mutationFn: (imageUrl: string) => api.createBanner({ imageUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setNewBannerUrl('');
      toast.success('Banner adicionado com sucesso!');
    },
    onError: () => toast.error('Erro ao adicionar banner. Verifique a URL.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner removido!');
    },
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
      <p className="text-sm text-muted-foreground font-sans">Carregando seus banners...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Banners Promocionais</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie as imagens de destaque que aparecem no topo do seu cardápio.
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Cole a URL da imagem (ex: https://imgur.com/...)" 
              value={newBannerUrl}
              onChange={(e) => setNewBannerUrl(e.target.value)}
              className="focus-visible:ring-primary"
            />
            <Button 
              disabled={!newBannerUrl || createMutation.isPending}
              onClick={() => createMutation.mutate(newBannerUrl)}
              className="min-w-[120px]"
            >
              {createMutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </div>

          {/* Preview da URL digitada */}
          {newBannerUrl && (
            <div className="relative h-20 w-full rounded-md overflow-hidden border bg-muted/50 flex items-center justify-center">
              <img 
                src={newBannerUrl} 
                alt="Preview" 
                className="h-full w-full object-cover opacity-50"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <span className="absolute text-[10px] font-mono text-muted-foreground bg-white/80 px-2 py-0.5 rounded">
                Pré-visualização da imagem
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Banners */}
      {banners?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-xl bg-muted/20">
          <ImageIcon className="h-12 w-12 text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum banner cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners?.map((banner: any) => (
            <div 
              key={banner.id} 
              className="relative group rounded-xl overflow-hidden border shadow-sm h-40 bg-muted"
            >
              <img 
                src={banner.imageUrl} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                alt="Banner promocional"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-10 w-10 rounded-full"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if(confirm("Deseja realmente excluir este banner?")) {
                      deleteMutation.mutate(banner.id)
                    }
                  }}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 bg-blue-50 p-4 rounded-lg text-blue-800 border border-blue-100">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <p className="text-xs leading-relaxed">
          <strong>Dica:</strong> Para melhores resultados, utilize imagens retangulares (proporção 16:9 ou 21:9). 
          Recomendamos hospedar suas imagens no <a href="https://imgur.com" target="_blank" className="underline font-bold">Imgur</a> ou plataformas similares.
        </p>
      </div>
    </div>
  );
}