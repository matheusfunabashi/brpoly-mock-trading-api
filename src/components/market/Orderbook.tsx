import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatProbabilityAsBrl, formatDecimal } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderbookProps {
  marketId: string;
  outcomeId: string;
}

export function Orderbook({ marketId, outcomeId }: OrderbookProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['orderbook', marketId, outcomeId],
    queryFn: () => apiClient.getOrderbook(marketId, outcomeId),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  const maxAmount = Math.max(
    ...([...(data?.bids || []), ...(data?.asks || [])].map(l => parseFloat(l.amount)))
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
        <span>Preço</span>
        <span className="text-right">Quantidade</span>
      </div>

      {/* Asks (sells) - reversed to show highest first */}
      <div className="space-y-1">
        {data?.asks
          .slice()
          .reverse()
          .map((level, i) => {
            const width = (parseFloat(level.amount) / maxAmount) * 100;
            return (
              <div
                key={i}
                className="relative flex items-center justify-between rounded py-1 px-2 font-mono text-sm"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-sell/10 rounded"
                  style={{ width: `${width}%` }}
                />
                <span className="relative text-sell">
                  {formatProbabilityAsBrl(level.price)}
                </span>
                <span className="relative text-muted-foreground">
                  {formatDecimal(level.amount, 0)}
                </span>
              </div>
            );
          })}
      </div>

      {/* Spread indicator */}
      <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span>Spread</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Bids (buys) */}
      <div className="space-y-1">
        {data?.bids.map((level, i) => {
          const width = (parseFloat(level.amount) / maxAmount) * 100;
          return (
            <div
              key={i}
              className="relative flex items-center justify-between rounded py-1 px-2 font-mono text-sm"
            >
              <div
                className="absolute inset-y-0 right-0 bg-buy/10 rounded"
                style={{ width: `${width}%` }}
              />
              <span className="relative text-buy">
                {formatProbabilityAsBrl(level.price)}
              </span>
              <span className="relative text-muted-foreground">
                {formatDecimal(level.amount, 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
