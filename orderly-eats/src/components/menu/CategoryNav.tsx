import { cn } from '@/lib/utils';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string | null;
  onSelect: (cat: string | null) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
  if (categories.length <= 1) return null;

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onSelect(null)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
              activeCategory === null
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-secondary'
            )}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
