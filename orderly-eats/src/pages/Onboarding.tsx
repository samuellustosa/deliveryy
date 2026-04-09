import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const niches = [
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'lanchonete', label: 'Lanchonete' },
  { value: 'pizzaria', label: 'Pizzaria' },
  { value: 'doceria', label: 'Doceria' },
  { value: 'padaria', label: 'Padaria' },
  { value: 'outro', label: 'Outro' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ 
    name: '', 
    slug: '', 
    phone: '', 
    niche: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'name') {
      const generatedSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setForm(prev => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      // 1. Criar o Usuário (Dono)
      // O backend espera { email, password } e salva o email no campo 'phone' do BD
      const { token } = await api.signup({
        email: form.phone, 
        password: form.password,
      });

      // 2. Autentica as próximas requisições
      api.setToken(token);

      // 3. Criar a Loja vinculada ao usuário
      await api.createStore({
        name: form.name,
        slug: form.slug,
        phone: form.phone,
        niche: form.niche,
        password: form.password, // Opcional se sua rota de loja não exigir
      });

      toast.success('Conta e loja criadas com sucesso!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao criar conta ou loja.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    <div key="0" className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da loja</Label>
        <Input 
          id="name"
          placeholder="Ex: Pizzaria do Sam" 
          value={form.name} 
          onChange={e => updateForm('name', e.target.value)} 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Link do seu cardápio</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-muted px-2 py-2 rounded-md">/m/</span>
          <Input 
            id="slug"
            placeholder="pizzaria-do-sam" 
            value={form.slug} 
            onChange={e => updateForm('slug', e.target.value)} 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="niche">O que você vende?</Label>
        <Select value={form.niche} onValueChange={v => updateForm('niche', v)}>
          <SelectTrigger id="niche">
            <SelectValue placeholder="Selecione o nicho" />
          </SelectTrigger>
          <SelectContent>
            {niches.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>,

    <div key="1" className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <Label htmlFor="phone">E-mail de acesso</Label>
        <Input 
          id="phone"
          type="email"
          placeholder="exemplo@email.com" 
          value={form.phone} 
          onChange={e => updateForm('phone', e.target.value)} 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input 
          id="password"
          type="password" 
          placeholder="Mínimo 6 caracteres" 
          value={form.password} 
          onChange={e => updateForm('password', e.target.value)} 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input 
          id="confirmPassword"
          type="password" 
          placeholder="••••••••" 
          value={form.confirmPassword} 
          onChange={e => updateForm('confirmPassword', e.target.value)} 
        />
      </div>
    </div>,
  ];

  const canNext = step === 0 
    ? form.name && form.slug && form.niche 
    : form.phone && form.password.length >= 6 && form.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-inner">
            <Store className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Crie sua loja</CardTitle>
          <CardDescription>Passo {step + 1} de {steps.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {steps[step]}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1" disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext} className="flex-1">
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canNext || loading} className="flex-1">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Check className="mr-2 h-4 w-4" /> Finalizar</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}