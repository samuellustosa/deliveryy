import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function MenuItemCard({ item, onAdd, index, currency = "R$" }: any) {
  // O Prisma usa 'isActive'. Se for falso, o produto não aparece.
  if (!item.isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex gap-4 rounded-lg border border-border bg-card p-3 shadow-sm"
    >
      {item.imageUrl && (
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md">
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-primary">{currency} {item.price.toFixed(2)}</span>
          <button onClick={() => onAdd(item)} className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}