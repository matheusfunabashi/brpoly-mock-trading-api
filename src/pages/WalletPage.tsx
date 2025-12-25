import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatBrl } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function WalletPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: balance, isLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => apiClient.getBalance(),
  });

  const { mutate: createDeposit, isPending } = useMutation({
    mutationFn: () => apiClient.createPixDeposit({ amountBrl: depositAmount }),
    onSuccess: (data) => {
      toast({
        title: 'Pix gerado!',
        description: `Use o código Pix para depositar ${formatBrl(data.amountBrl)}`,
      });
      setIsDialogOpen(false);
      setDepositAmount('');
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao gerar Pix',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container py-8">
          <h1 className="mb-6 text-3xl font-bold">Carteira</h1>

          {/* Balance Card */}
          <div className="glass-card max-w-md p-6">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-5 w-5" />
              <span>Saldo total</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <p className="text-4xl font-bold font-mono">
                {balance ? formatBrl(balance.totalBrl) : 'R$ 0,00'}
              </p>
            )}

            <div className="mt-4 flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Disponível: </span>
                <span className="font-mono font-medium">
                  {balance ? formatBrl(balance.brlAvailable) : 'R$ 0,00'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Reservado: </span>
                <span className="font-mono font-medium text-muted-foreground">
                  {balance ? formatBrl(balance.brlReserved) : 'R$ 0,00'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Depositar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Depositar via Pix</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="100.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <Button
                      onClick={() => createDeposit()}
                      disabled={isPending || !depositAmount}
                      className="w-full"
                    >
                      {isPending ? 'Gerando...' : 'Gerar código Pix'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="flex-1">
                Sacar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="container py-8">
        <h2 className="mb-4 text-xl font-semibold">Transações recentes</h2>

        <div className="space-y-3">
          {/* Mock transactions */}
          <div className="glass-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-buy/10">
                <ArrowDownRight className="h-5 w-5 text-buy" />
              </div>
              <div>
                <p className="font-medium">Depósito Pix</p>
                <p className="text-sm text-muted-foreground">20 dez 2024</p>
              </div>
            </div>
            <span className="font-mono font-semibold text-buy">+R$ 500,00</span>
          </div>

          <div className="glass-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sell/10">
                <ArrowUpRight className="h-5 w-5 text-sell" />
              </div>
              <div>
                <p className="font-medium">Saque Pix</p>
                <p className="text-sm text-muted-foreground">15 dez 2024</p>
              </div>
            </div>
            <span className="font-mono font-semibold text-sell">-R$ 200,00</span>
          </div>

          <div className="glass-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-buy/10">
                <ArrowDownRight className="h-5 w-5 text-buy" />
              </div>
              <div>
                <p className="font-medium">Depósito Pix</p>
                <p className="text-sm text-muted-foreground">10 dez 2024</p>
              </div>
            </div>
            <span className="font-mono font-semibold text-buy">+R$ 1.000,00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
