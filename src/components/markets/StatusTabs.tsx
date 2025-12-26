import { cn } from '@/lib/utils';

export type StatusFilter = 'open' | 'closed' | 'resolved' | '';

const statuses: { id: StatusFilter; label: string }[] = [
  { id: '', label: 'Todos' },
  { id: 'open', label: 'Abertos' },
  { id: 'closed', label: 'Fechados' },
  { id: 'resolved', label: 'Resolvidos' },
];

interface StatusTabsProps {
  selected: StatusFilter;
  onChange: (status: StatusFilter) => void;
}

export function StatusTabs({ selected, onChange }: StatusTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-secondary/50 p-1">
      {statuses.map((status) => (
        <button
          key={status.id}
          onClick={() => onChange(status.id)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
            selected === status.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}
