import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Market } from '@/lib/api/types';
import { MarketCard } from './MarketCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { SortOption } from './SortSelect';
import type { StatusFilter } from './StatusTabs';

interface MarketListProps {
  category?: string;
  search?: string;
  sort?: SortOption;
  status?: StatusFilter;
}

function sortMarkets(markets: Market[], sort: SortOption): Market[] {
  const sorted = [...markets];
  switch (sort) {
    case 'volume':
      return sorted.sort((a, b) => parseFloat(b.volumeBrl) - parseFloat(a.volumeBrl));
    case 'new':
      return sorted.sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());
    case 'closing':
      return sorted.sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());
    default:
      return sorted;
  }
}

export function MarketList({ category, search, sort = 'volume', status }: MarketListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['markets', category, search, status],
    queryFn: () => apiClient.listMarkets({ category, q: search, status: status || undefined }),
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

  const sortedMarkets = sortMarkets(data.items, sort);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedMarkets.map((market, index) => (
        <MarketCard key={market.id} market={market} index={index} />
      ))}
    </div>
  );
}
