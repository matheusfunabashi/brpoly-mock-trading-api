import { Link } from 'react-router-dom';
import type { Market } from '@/lib/api';
import { formatProbabilityAsPercent, formatVolume, formatRelativeDate } from '@/lib/format';
import { Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MarketCardProps {
  market: Market;
  index?: number;
}

export function MarketCard({ market, index = 0 }: MarketCardProps) {
  const yesPrice = market.currentPrices.find(p => p.outcomeId === 'yes');
  const probability = yesPrice ? parseFloat(yesPrice.price) : 0.5;

  return (
    <Link
      to={`/market/${market.id}`}
      className="glass-card group block p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <Badge variant="secondary" className="shrink-0 text-xs">
          {market.category}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatRelativeDate(market.closeTime)}
        </div>
      </div>

      <h3 className="mb-4 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
        {market.title}
      </h3>

      <div className="mb-4">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-3xl font-bold text-primary font-mono">
            {formatProbabilityAsPercent(probability)}
          </span>
          <span className="text-sm text-muted-foreground">chance de Sim</span>
        </div>
        <div className="probability-bar">
          <div
            className="probability-bar-fill"
            style={{ width: `${probability * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span className="font-mono">{formatVolume(market.volumeBrl)}</span>
          <span className="text-xs">volume</span>
        </div>
        <div className="flex gap-3">
          {market.outcomes.slice(0, 2).map((outcome, i) => {
            const price = market.currentPrices.find(p => p.outcomeId === outcome.id);
            return (
              <div
                key={outcome.id}
                className={`rounded-md px-2.5 py-1 font-mono text-sm font-medium ${
                  i === 0
                    ? 'bg-buy/10 text-buy'
                    : 'bg-sell/10 text-sell'
                }`}
              >
                {outcome.title} {price ? formatProbabilityAsPercent(price.price) : '—'}
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
