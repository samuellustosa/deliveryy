// web/src/components/menu/MenuHeader.tsx
import { motion } from "framer-motion";

interface Props {
  businessName?: string;
  subtitle?: string;
  heroImage?: string;
}

export default function MenuHeader({ businessName, subtitle, heroImage }: Props) {
  // Se não vier nada da API, usamos valores padrão genéricos
  const name = businessName ?? "Carregando...";
  const sub = subtitle ?? "Seja bem-vindo!";

  return (
    <header className="relative overflow-hidden bg-primary px-6 pb-12 pt-16 text-primary-foreground">
      {/* Camada de gradiente para garantir leitura do texto */}
      <div 
        className="absolute inset-0 opacity-40 z-10" 
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))" }} 
      />
      
      {/* Imagem de Capa/Logo vinda do Cloudinary */}
      {heroImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt={name} 
            className="h-full w-full object-cover opacity-50" 
          />
        </div>
      )}

      <div className="relative z-20 mx-auto max-w-2xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
        >
          {name}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-lg opacity-90"
        >
          {sub}
        </motion.p>
      </div>
    </header>
  );
}