import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatProbabilityAsBrl, formatDecimal, formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  open: 'Aberta',
  partial: 'Parcial',
  filled: 'Executada',
  canceled: 'Cancelada',
  expired: 'Expirada',
};

export function OrdersList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.listOrders(),
  });

  const { mutate: cancelOrder, isPending } = useMutation({
    mutationFn: (orderId: string) => apiClient.cancelOrder(orderId),
    onSuccess: () => {
      toast({ title: 'Ordem cancelada' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cancelar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="mb-2 text-lg font-medium">Nenhuma ordem</p>
        <p className="text-muted-foreground">
          Suas ordens aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.items.map((order) => {
        const canCancel = order.status === 'open' || order.status === 'partial';
        
        return (
          <div
            key={order.id}
            className="glass-card flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-semibold uppercase',
                  order.side === 'buy' ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'
                )}
              >
                {order.side === 'buy' ? 'Compra' : 'Venda'}
              </div>
              <div>
                <p className="font-mono text-sm">
                  {formatDecimal(order.amount, 0)} @{' '}
                  {order.price ? formatProbabilityAsBrl(order.price) : 'Mercado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Executado: {formatDecimal(order.filledAmount, 0)} •{' '}
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant={
                  order.status === 'filled'
                    ? 'default'
                    : order.status === 'canceled'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {statusLabels[order.status] || order.status}
              </Badge>
              {canCancel && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => cancelOrder(order.id)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
