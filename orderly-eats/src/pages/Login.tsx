import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Alterado de email para identifier
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // O segredo está aqui: passamos o 'identifier' que o backend espera como 'phone'
      await login(identifier, password);
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err: any) {
      // Melhorei a captura de erro para mostrar a mensagem vinda do seu Fastify
      const message = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <UtensilsCrossed className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Entrar no painel</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar sua loja</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">E-mail ou Telefone</Label>
              <Input 
                id="identifier" 
                type="text" // Mudado para text para aceitar o que estiver no campo 'phone' do banco
                placeholder="seu@email.com ou telefone" 
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/onboarding" className="text-primary font-medium hover:underline">
              Criar loja
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}