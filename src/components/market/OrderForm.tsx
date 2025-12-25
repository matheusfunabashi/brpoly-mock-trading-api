import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Market, type OrderSide } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatProbabilityAsBrl, formatBrl } from '@/lib/format';

interface OrderFormProps {
  market: Market;
}

export function OrderForm({ market }: OrderFormProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [side, setSide] = useState<OrderSide>('buy');
  const [selectedOutcome, setSelectedOutcome] = useState(market.outcomes[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  const currentPrice = market.currentPrices.find(p => p.outcomeId === selectedOutcome);

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () =>
      apiClient.placeOrder({
        marketId: market.id,
        outcomeId: selectedOutcome,
        side,
        type: 'limit',
        price,
        amount,
      }),
    onSuccess: () => {
      toast({
        title: 'Ordem enviada!',
        description: 'Sua ordem foi colocada com sucesso.',
      });
      setAmount('');
      setPrice('');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar ordem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const estimatedCost = parseFloat(amount || '0') * parseFloat(price || '0');
  const potentialReturn = parseFloat(amount || '0') * (1 - parseFloat(price || '0'));

  if (!isAuthenticated) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="mb-4 text-muted-foreground">
          Faça login para começar a negociar
        </p>
        <Button asChild className="w-full">
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Side Toggle */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-secondary p-1">
        <button
          onClick={() => setSide('buy')}
          className={cn(
            'rounded-md py-2.5 text-sm font-semibold transition-all duration-200',
            side === 'buy'
              ? 'bg-buy text-buy-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Comprar
        </button>
        <button
          onClick={() => setSide('sell')}
          className={cn(
            'rounded-md py-2.5 text-sm font-semibold transition-all duration-200',
            side === 'sell'
              ? 'bg-sell text-sell-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Vender
        </button>
      </div>

      {/* Outcome Selection */}
      <div className="mb-6 space-y-2">
        <Label>Resultado</Label>
        <div className="grid grid-cols-2 gap-2">
          {market.outcomes.map((outcome) => {
            const outPrice = market.currentPrices.find(p => p.outcomeId === outcome.id);
            return (
              <button
                key={outcome.id}
                onClick={() => {
                  setSelectedOutcome(outcome.id);
                  if (outPrice) setPrice(outPrice.price);
                }}
                className={cn(
                  'rounded-lg border p-3 text-left transition-all duration-200',
                  selectedOutcome === outcome.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="block text-sm font-medium">{outcome.title}</span>
                <span className="font-mono text-lg font-bold text-primary">
                  {outPrice ? formatProbabilityAsBrl(outPrice.price) : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4 space-y-2">
        <Label htmlFor="amount">Quantidade (contratos)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="font-mono"
        />
      </div>

      {/* Price */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="price">Preço limite</Label>
          {currentPrice && (
            <button
              onClick={() => setPrice(currentPrice.price)}
              className="text-xs text-primary hover:underline"
            >
              Usar atual ({formatProbabilityAsBrl(currentPrice.price)})
            </button>
          )}
        </div>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0.01"
          max="0.99"
          placeholder="0.50"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="font-mono"
        />
      </div>

      {/* Summary */}
      {amount && price && (
        <div className="mb-6 rounded-lg bg-secondary/50 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custo estimado</span>
            <span className="font-mono font-medium">{formatBrl(estimatedCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Retorno se ganhar</span>
            <span className="font-mono font-medium text-buy">
              +{formatBrl(potentialReturn)}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={() => placeOrder()}
        disabled={isPending || !amount || !price}
        variant={side === 'buy' ? 'buy' : 'sell'}
        className="w-full"
        size="lg"
      >
        {isPending ? 'Enviando...' : side === 'buy' ? 'Comprar' : 'Vender'}
      </Button>
    </div>
  );
}
