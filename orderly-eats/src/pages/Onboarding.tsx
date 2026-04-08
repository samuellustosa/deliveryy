import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UtensilsCrossed, Store, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
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
  const [form, setForm] = useState({ name: '', slug: '', phone: '', niche: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'name') {
      setForm(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));
    }
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      const { token } = await api.createStore({
        name: form.name,
        slug: form.slug,
        phone: form.phone,
        niche: form.niche,
        password: form.password,
      });
      api.setToken(token);
      toast.success('Loja criada com sucesso!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar loja');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    // Step 0: Store info
    <div key="0" className="space-y-4">
      <div className="space-y-2">
        <Label>Nome da loja</Label>
        <Input placeholder="Minha Loja Deliciosa" value={form.name} onChange={e => updateForm('name', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Slug (URL do cardápio)</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">/m/</span>
          <Input placeholder="minha-loja" value={form.slug} onChange={e => updateForm('slug', e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Nicho</Label>
        <Select value={form.niche} onValueChange={v => updateForm('niche', v)}>
          <SelectTrigger><SelectValue placeholder="Selecione o nicho" /></SelectTrigger>
          <SelectContent>
            {niches.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>,
    // Step 1: Contact & password
    <div key="1" className="space-y-4">
      <div className="space-y-2">
        <Label>Telefone / WhatsApp</Label>
        <Input placeholder="(11) 99999-9999" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Senha</Label>
        <Input type="password" placeholder="••••••••" value={form.password} onChange={e => updateForm('password', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Confirmar senha</Label>
        <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} />
      </div>
    </div>,
  ];

  const canNext = step === 0 ? form.name && form.slug && form.niche : form.phone && form.password && form.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Store className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Crie sua loja</CardTitle>
          <CardDescription>Etapa {step + 1} de {steps.length}</CardDescription>
          <div className="flex gap-2 justify-center mt-3">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${i <= step ? 'w-8 bg-primary' : 'w-8 bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {steps[step]}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
                <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext} className="flex-1">
                Próximo <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canNext || loading} className="flex-1">
                {loading ? <Loader2 className="animate-spin" /> : <><Check className="mr-1 h-4 w-4" /> Criar loja</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
