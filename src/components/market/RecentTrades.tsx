import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatProbabilityAsBrl, formatDecimal, formatDateTime } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface RecentTradesProps {
  marketId: string;
}

export function RecentTrades({ marketId }: RecentTradesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['trades', marketId],
    queryFn: () => apiClient.listTrades(marketId, { limit: 10 }),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma negociação recente
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {data.items.map((trade) => (
        <div
          key={trade.id}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-secondary/50"
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'w-16 font-mono font-medium',
                trade.takerSide === 'buy' ? 'text-buy' : 'text-sell'
              )}
            >
              {formatProbabilityAsBrl(trade.price)}
            </span>
            <span className="text-muted-foreground">
              {formatDecimal(trade.amount, 0)} contratos
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(trade.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
