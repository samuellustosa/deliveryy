import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api"; // Importando sua conexão com o backend

export default function Onboarding() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gera um slug simples (ex: "Minha Loja" -> "minha-loja")
      const slug = name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Envia os dados para a rota que você criou no Node.js
      await api.post("/stores", {
        name,
        slug,
        description: description || `Loja oficial de ${name}`,
      });

      toast({ 
        title: "Perfil configurado!", 
        description: "Sua loja foi criada com sucesso." 
      });

      // Redireciona para o dashboard administrativo
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao configurar",
        description: error.response?.data?.message || "Não foi possível criar sua loja agora.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configure sua Loja</CardTitle>
          <CardDescription>Dê as informações básicas para o seu novo delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFinish} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Lanchonete</label>
              <Input 
                placeholder="Ex: Burger do Samuel" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição (Opcional)</label>
              <Input 
                placeholder="Ex: Os melhores lanches de Piripiri" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button 
              className="w-full" 
              type="submit" 
              disabled={isLoading || !name}
            >
              {isLoading ? "Criando loja..." : "Concluir Configuração"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}