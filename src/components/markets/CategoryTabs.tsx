import { cn } from '@/lib/utils';

const categories = [
  { id: '', label: 'Todos' },
  { id: 'Política', label: 'Política' },
  { id: 'Economia', label: 'Economia' },
  { id: 'Esportes', label: 'Esportes' },
  { id: 'Entretenimento', label: 'Entretenimento' },
  { id: 'Tecnologia', label: 'Tecnologia' },
];

interface CategoryTabsProps {
  selected: string;
  onChange: (category: string) => void;
}

export function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
            selected === category.id
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
