import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Loader2, Image as ImageIcon, Info, UploadCloud, Type, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function Banners() {
  const queryClient = useQueryClient();
  const [customText, setCustomText] = useState('');
  const [bgColor, setBgColor] = useState('#fbbf24'); // Amarelo padrão
  const [textColor, setTextColor] = useState('#000000'); // COR DA FONTE (Preto padrão)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Busca os banners existentes
  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => api.getBanners(),
  });

  // Mutação para UPLOAD
  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadBanner(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setCustomText('');
      toast.success('Banner adicionado ao cardápio!');
    },
    onError: () => toast.error('Erro ao processar imagem.')
  });

  // Mutação para DELETAR
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner removido!');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return toast.error("Selecione uma imagem válida.");
      if (file.size > 5 * 1024 * 1024) return toast.error("Máximo de 5MB.");
      uploadMutation.mutate(file);
    }
  };

  const handleCreateTextBanner = () => {
    const canvas = canvasRef.current;
    if (!canvas || !customText) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Desenha Fundo
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configura Texto usando a cor escolhida pelo lojista
    ctx.fillStyle = textColor; 
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Adiciona o texto no centro (maiúsculo para destaque)
    ctx.fillText(customText.toUpperCase(), canvas.width / 2, canvas.height / 2);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "aviso.png", { type: "image/png" });
        uploadMutation.mutate(file);
      }
    }, 'image/png');
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
      <p className="text-sm text-muted-foreground font-sans font-bold uppercase tracking-tighter">Sincronizando Banners...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto font-sans animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">Marketing e Avisos</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Crie avisos rápidos ou suba artes promocionais para seus clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOCO 1: UPLOAD DE ARTE PRONTA */}
        <Card className="border-2 border-dashed border-gray-200 hover:border-primary/40 transition-all bg-white rounded-[2rem] overflow-hidden shadow-sm">
          <label className="flex flex-col items-center justify-center p-8 cursor-pointer w-full h-full group">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploadMutation.isPending} />
            <div className="bg-primary/10 p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <p className="font-bold text-gray-700 text-center uppercase tracking-tight">Subir arte pronta</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">JPG, PNG ou WebP</p>
          </label>
        </Card>

        {/* BLOCO 2: CRIADOR DE AVISOS RÁPIDOS (Agora com Cor da Fonte) */}
        <Card className="border-none shadow-sm bg-primary/5 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Type className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-primary">Aviso Rápido</h3>
          </div>

          <textarea 
            placeholder="Ex: HOJE TEM PROMOÇÃO! 🍕"
            className="w-full p-4 rounded-2xl border-none shadow-inner bg-white text-sm h-24 focus:ring-2 focus:ring-primary outline-none resize-none font-bold"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Seletor de Cor do Fundo */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Fundo</span>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-12 rounded-lg cursor-pointer border-2 border-white shadow-sm" />
              </div>

              {/* Seletor de Cor do Texto */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Texto</span>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-10 w-12 rounded-lg cursor-pointer border-2 border-white shadow-sm" />
              </div>
            </div>
            
            <Button 
              className="rounded-xl font-bold px-8 h-12 shadow-lg shadow-primary/20 transition-transform hover:scale-105" 
              disabled={!customText || uploadMutation.isPending}
              onClick={handleCreateTextBanner}
            >
              {uploadMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Gerar Aviso"}
            </Button>
          </div>

          <canvas ref={canvasRef} width={1200} height={400} className="hidden" />
        </Card>
      </div>

      {/* Lista de Banners */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          Banners Ativos <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{banners?.length || 0}</span>
        </h3>
        
        {banners?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border rounded-[2rem] bg-white border-dashed">
            <ImageIcon className="h-12 w-12 text-muted-foreground/10 mb-3" />
            <p className="text-muted-foreground text-sm font-medium uppercase font-bold tracking-tight">Nenhum banner ou aviso ativo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners?.map((banner) => (
              <div key={banner.id} className="relative group rounded-[2rem] overflow-hidden border-4 border-white shadow-xl h-48 bg-muted">
                <img src={banner.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Banner" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                  <Button 
                    variant="destructive" size="icon" className="h-14 w-14 rounded-2xl shadow-2xl hover:scale-110 transition-transform"
                    disabled={deleteMutation.isPending}
                    onClick={() => confirm("Remover este banner?") && deleteMutation.mutate(banner.id)}
                  >
                    <Trash2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Informativo */}
      <div className="flex items-start gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="bg-blue-500 p-2 rounded-xl text-white">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold">Marketing Inteligente</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Personalize as cores para que o texto fique legível. Banners com alto contraste ajudam os clientes de Piripiri a verem suas ofertas mais rápido!
          </p>
        </div>
      </div>
    </div>
  );
}