// web/src/components/menu/FloatingCartButton.tsx
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface Props {
  totalItems: number;
  total: number;
  onClick: () => void;
  currency?: string; // Agora recebemos a moeda via props
}

export default function FloatingCartButton({ totalItems, total, onClick, currency = "R$" }: Props) {
  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={onClick}
        className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-primary px-6 py-4 text-primary-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary">
            {totalItems}
          </span>
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] uppercase tracking-wider opacity-80">Ver Carrinho</span>
          <span className="text-lg font-bold">
            {currency} {total.toFixed(2)}
          </span>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}