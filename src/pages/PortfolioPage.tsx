import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PositionsList } from '@/components/portfolio/PositionsList';
import { OrdersList } from '@/components/portfolio/OrdersList';
import { formatBrl } from '@/lib/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function PortfolioPage() {
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => apiClient.getBalance(),
  });

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: () => apiClient.listPositions(),
  });

  // Calculate total PnL from positions
  const totalPnl = positions?.items.reduce(
    (acc, pos) => acc + parseFloat(pos.pnlBrl),
    0
  ) || 0;

  const totalValue = positions?.items.reduce(
    (acc, pos) => acc + parseFloat(pos.size) * parseFloat(pos.lastPrice),
    0
  ) || 0;

  const isProfit = totalPnl >= 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container py-8">
          <h1 className="mb-6 text-3xl font-bold">Meu Portfólio</h1>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Balance */}
            <div className="glass-card p-5">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Saldo disponível</span>
              </div>
              {balanceLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold font-mono">
                  {balance ? formatBrl(balance.brlAvailable) : 'R$ 0,00'}
                </p>
              )}
            </div>

            {/* Reserved */}
            <div className="glass-card p-5">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Em ordens</span>
              </div>
              {balanceLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold font-mono text-muted-foreground">
                  {balance ? formatBrl(balance.brlReserved) : 'R$ 0,00'}
                </p>
              )}
            </div>

            {/* Positions Value */}
            <div className="glass-card p-5">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Valor em posições</span>
              </div>
              <p className="text-2xl font-bold font-mono">
                {formatBrl(totalValue)}
              </p>
            </div>

            {/* Total PnL */}
            <div className="glass-card p-5">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                {isProfit ? (
                  <TrendingUp className="h-4 w-4 text-buy" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-sell" />
                )}
                <span className="text-sm">Lucro/Prejuízo</span>
              </div>
              <p
                className={`text-2xl font-bold font-mono ${
                  isProfit ? 'text-buy' : 'text-sell'
                }`}
              >
                {isProfit ? '+' : ''}
                {formatBrl(totalPnl)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="positions">Posições</TabsTrigger>
            <TabsTrigger value="orders">Ordens</TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <PositionsList />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
