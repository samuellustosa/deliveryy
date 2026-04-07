import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Smartphone, BarChart3, MessageCircle, Zap, Check, ArrowRight, Store } from "lucide-react";

const features = [
  { icon: Smartphone, title: "Cardápio Digital", desc: "Seu cardápio online bonito e responsivo, pronto em minutos." },
  { icon: MessageCircle, title: "Pedidos via WhatsApp", desc: "Clientes fazem pedidos direto pelo WhatsApp do seu negócio." },
  { icon: BarChart3, title: "Painel Completo", desc: "Gerencie cardápio, pedidos e configurações em um só lugar." },
  { icon: Zap, title: "Rápido e Fácil", desc: "Configure em 5 minutos. Sem necessidade de conhecimento técnico." },
];

const plans = [
  {
    name: "Grátis",
    price: "0",
    desc: "Para começar",
    features: ["1 cardápio digital", "Até 20 itens", "Pedidos via WhatsApp", "Link personalizado"],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Pro",
    price: "49",
    period: "/mês",
    desc: "Para crescer",
    features: ["Itens ilimitados", "Pedidos em tempo real", "Personalização avançada", "Suporte prioritário", "Relatórios básicos"],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "99",
    period: "/mês",
    desc: "Para escalar",
    features: ["Tudo do Pro", "Múltiplas unidades", "Integrações avançadas", "API de pedidos", "Suporte dedicado"],
    cta: "Assinar Premium",
    popular: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Store className="h-6 w-6 text-primary" />
            MenuSaaS
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--menu-hero-gradient)] opacity-5" />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              🚀 Plataforma #1 para Delivery
            </span>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Seu cardápio digital<br />
              <span className="text-primary">pronto em minutos</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Crie seu cardápio online, receba pedidos pelo WhatsApp e gerencie tudo em um painel simples.
              Para restaurantes, lanchonetes, pizzarias e qualquer delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Começar Grátis <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Ver funcionalidades ↓
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-foreground">
            Tudo que você precisa
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-background p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-center font-display text-3xl font-bold text-foreground">Planos simples</h2>
          <p className="mb-12 text-center text-muted-foreground">Comece grátis, cresça quando quiser</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    Mais Popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold text-foreground">R${plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block w-full rounded-lg py-3 text-center font-semibold transition-transform hover:scale-105 active:scale-95 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-secondary text-secondary-foreground"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MenuSaaS. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
