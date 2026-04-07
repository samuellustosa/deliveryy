import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    // No futuro, isso enviará um POST para seu Node.js
    toast({ title: "Perfil configurado!", description: "Vamos começar a vender." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configure sua Loja</CardTitle>
          <CardDescription>Dê um nome para o seu novo Micro SaaS</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFinish} className="space-y-4">
            <Input 
              placeholder="Nome da Lanchonete" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
            />
            <Button className="w-full" type="submit">Concluir Configuração</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}