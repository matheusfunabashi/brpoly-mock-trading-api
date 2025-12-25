import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatProbabilityAsPercent, formatVolume, formatRelativeDate } from '@/lib/format';
import { Orderbook } from '@/components/market/Orderbook';
import { OrderForm } from '@/components/market/OrderForm';
import { RecentTrades } from '@/components/market/RecentTrades';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, TrendingUp } from 'lucide-react';

export default function MarketDetailPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const [selectedOutcome, setSelectedOutcome] = useState('');

  const { data: market, isLoading, error } = useQuery({
    queryKey: ['market', marketId],
    queryFn: () => apiClient.getMarket(marketId!),
    enabled: !!marketId,
  });

  // Set default selected outcome
  if (market && !selectedOutcome && market.outcomes.length > 0) {
    setSelectedOutcome(market.outcomes[0].id);
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-8 w-24" />
        <Skeleton className="mb-8 h-12 w-2/3" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="container py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Mercado não encontrado</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            Voltar para mercados
          </Link>
        </div>
      </div>
    );
  }

  const yesPrice = market.currentPrices.find(p => p.outcomeId === 'yes');
  const probability = yesPrice ? parseFloat(yesPrice.price) : 0.5;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container py-6">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{market.category}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatRelativeDate(market.closeTime)}
                </span>
              </div>
              <h1 className="mb-3 text-2xl font-bold md:text-3xl">{market.title}</h1>
              <p className="text-muted-foreground">{market.description}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Chance de Sim</p>
                <p className="text-4xl font-bold text-primary font-mono">
                  {formatProbabilityAsPercent(probability)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="flex items-center gap-1 text-xl font-semibold font-mono">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  {formatVolume(market.volumeBrl)}
                </p>
              </div>
            </div>
          </div>

          {/* Outcome Pills */}
          <div className="mt-6 flex gap-3">
            {market.outcomes.map((outcome, i) => {
              const price = market.currentPrices.find(p => p.outcomeId === outcome.id);
              return (
                <button
                  key={outcome.id}
                  onClick={() => setSelectedOutcome(outcome.id)}
                  className={`rounded-lg px-4 py-2 font-mono text-sm font-semibold transition-all duration-200 ${
                    selectedOutcome === outcome.id
                      ? i === 0
                        ? 'bg-buy text-buy-foreground shadow-md'
                        : 'bg-sell text-sell-foreground shadow-md'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {outcome.title}{' '}
                  {price && formatProbabilityAsPercent(price.price)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Orderbook & Trades */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orderbook" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="orderbook">Livro de Ofertas</TabsTrigger>
                <TabsTrigger value="trades">Negociações</TabsTrigger>
              </TabsList>
              <TabsContent value="orderbook" className="glass-card p-6">
                {selectedOutcome && marketId && (
                  <Orderbook marketId={marketId} outcomeId={selectedOutcome} />
                )}
              </TabsContent>
              <TabsContent value="trades" className="glass-card p-6">
                {marketId && <RecentTrades marketId={marketId} />}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Order Form */}
          <div>
            <OrderForm market={market} />
          </div>
        </div>
      </div>
    </div>
  );
}
