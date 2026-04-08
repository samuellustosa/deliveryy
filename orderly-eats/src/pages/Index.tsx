import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, ArrowRight, Store, ShoppingBag, Zap } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="gradient-primary">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-foreground/20 mb-6">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Seu delivery digital em minutos
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Crie seu cardápio online, receba pedidos e gerencie tudo em um só lugar. Simples, rápido e profissional.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/onboarding">
                <Store className="mr-2 h-5 w-5" /> Criar minha loja
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/login">
                Já tenho conta <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Store, title: 'Crie sua loja', desc: 'Configure seu cardápio em poucos passos com nome, categorias e produtos.' },
            { icon: ShoppingBag, title: 'Receba pedidos', desc: 'Seus clientes fazem pedidos pelo celular e você acompanha em tempo real.' },
            { icon: Zap, title: 'Gerencie tudo', desc: 'Painel completo para controlar produtos, pedidos e status de entrega.' },
          ].map((f, i) => (
            <div key={i} className="text-center p-6 rounded-xl bg-card border">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
