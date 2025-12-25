import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { MarketCard } from './MarketCard';
import { Skeleton } from '@/components/ui/skeleton';

interface MarketListProps {
  category?: string;
  search?: string;
}

export function MarketList({ category, search }: MarketListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['markets', category, search],
    queryFn: () => apiClient.listMarkets({ category, q: search, status: 'open' }),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <Skeleton className="mb-3 h-5 w-20" />
            <Skeleton className="mb-4 h-12 w-full" />
            <Skeleton className="mb-4 h-8 w-24" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">Erro ao carregar mercados</p>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Nenhum mercado encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.items.map((market, index) => (
        <MarketCard key={market.id} market={market} index={index} />
      ))}
    </div>
  );
}
