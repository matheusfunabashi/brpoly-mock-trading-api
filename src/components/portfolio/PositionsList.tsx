import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatBrl, formatProbabilityAsBrl, formatDecimal } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function PositionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: () => apiClient.listPositions(),
  });

  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => apiClient.listMarkets({ limit: 100 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="mb-2 text-lg font-medium">Nenhuma posição ainda</p>
        <p className="text-muted-foreground">
          Comece a negociar para ver suas posições aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.items.map((position) => {
        const market = markets?.items.find(m => m.id === position.marketId);
        const outcome = market?.outcomes.find(o => o.id === position.outcomeId);
        const pnl = parseFloat(position.pnlBrl);
        const isProfit = pnl >= 0;

        return (
          <Link
            key={`${position.marketId}-${position.outcomeId}`}
            to={`/market/${position.marketId}`}
            className="glass-card block p-5 transition-all duration-200 hover:border-primary/30"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-medium">
                  {market?.title || position.marketId}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {outcome?.title || position.outcomeId}
                </span>
              </div>
              <div
                className={cn(
                  'rounded-lg px-3 py-1.5 font-mono text-sm font-semibold',
                  isProfit ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'
                )}
              >
                {isProfit ? '+' : ''}
                {formatBrl(pnl)}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tamanho</span>
                <p className="font-mono font-medium">
                  {formatDecimal(position.size, 0)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Preço médio</span>
                <p className="font-mono font-medium">
                  {formatProbabilityAsBrl(position.avgPrice)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Preço atual</span>
                <p className="font-mono font-medium">
                  {formatProbabilityAsBrl(position.lastPrice)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor</span>
                <p className="font-mono font-medium">
                  {formatBrl(
                    parseFloat(position.size) * parseFloat(position.lastPrice)
                  )}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
