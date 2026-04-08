import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";

export default function Auth({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        // Fluxo de LOGIN
        const response = await api.post("/login", { email, password });
        const { token } = response.data;

        localStorage.setItem('delivery_token', token);

        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso. Redirecionando...",
        });
        
        navigate("/dashboard");
      } else {
        // Fluxo de CADASTRO (SIGNUP)
        await api.post("/signup", { email, password });

        toast({
          title: "Conta criada com sucesso!",
          description: "Agora você já pode entrar no sistema.",
        });
        
        // Após cadastrar, levamos o usuário para a tela de login
        navigate("/login");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: mode === "login" ? "Erro no login" : "Erro no cadastro",
        description: error.response?.data?.message || "Verifique seus dados e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {mode === "login" ? "Entrar no Sistema" : "Criar sua Conta"}
          </CardTitle>
          <CardDescription>
            {mode === "login" 
              ? "Entre com suas credenciais para gerenciar sua loja" 
              : "Preencha os campos abaixo para começar sua jornada"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input 
                type="password" 
                placeholder="No mínimo 6 caracteres" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required 
                minLength={6}
              />
            </div>
            <Button className="w-full font-semibold" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </>
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Cadastrar agora"
              )}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate(mode === "login" ? "/signup" : "/login")}
                className="text-sm text-primary hover:underline"
              >
                {mode === "login" 
                  ? "Não tem uma conta? Cadastre-se" 
                  : "Já possui uma conta? Faça login"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}