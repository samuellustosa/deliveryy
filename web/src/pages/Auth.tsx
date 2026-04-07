import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

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
        // Chamada real para o seu Backend na porta 3333
        const data = await apiService.login({ email, password });
        
        // Salva o Token JWT no localStorage para manter a sessão ativa
        localStorage.setItem('@samuelburger:token', data.token);

        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso. Redirecionando...",
        });
        
        navigate("/dashboard");
      } else {
        // Lógica de Signup pode ser implementada futuramente aqui
        toast({
          title: "Funcionalidade em breve",
          description: "O cadastro de novos lojistas será liberado em breve.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: "E-mail ou senha incorretos. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === "login" ? "Entrar no Samuel's Burger" : "Criar sua conta"}
          </CardTitle>
          <CardDescription>
            {mode === "login" 
              ? "Digite suas credenciais para gerenciar sua loja" 
              : "Cadastre sua loja em nossa plataforma de delivery"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Sua senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}