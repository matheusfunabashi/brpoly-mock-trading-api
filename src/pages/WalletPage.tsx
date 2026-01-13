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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, Coins } from 'lucide-react';
import type { PixDeposit, PixKeyType } from '@/lib/api/types';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function WalletPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastDeposit, setLastDeposit] = useState<PixDeposit | null>(null);

  const { data: balance, isLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => apiClient.getBalance(),
  });

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawKeyType, setWithdrawKeyType] = useState<PixKeyType>('cpf');
  const [withdrawKeyValue, setWithdrawKeyValue] = useState('');
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const [cryptoAsset, setCryptoAsset] = useState('USDC');
  const [cryptoChain, setCryptoChain] = useState('polygon');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoWithdrawalAmount, setCryptoWithdrawalAmount] = useState('');

  const { mutate: createDeposit, isPending } = useMutation({
    mutationFn: () => apiClient.createPixDeposit({ amountBrl: depositAmount }),
    onSuccess: (data) => {
      toast({
        title: 'Pix gerado!',
        description: `Use o código Pix para depositar ${formatBrl(data.amountBrl)}`,
      });
      setDepositAmount('');
      setLastDeposit(data);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao gerar Pix',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { mutate: completeDeposit, isPending: isCompletingDeposit } = useMutation({
    mutationFn: (depositId: string) => apiClient.devCompletePixDeposit(depositId),
    onSuccess: ({ deposit }) => {
      setLastDeposit(deposit);
      setIsDialogOpen(false);
      toast({
        title: 'Depósito confirmado',
        description: `Saldo atualizado com ${formatBrl(deposit.amountBrl)}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao confirmar depósito',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { mutate: createWithdrawal, isPending: isWithdrawing } = useMutation({
    mutationFn: () =>
      apiClient.createPixWithdrawal({
        amountBrl: withdrawAmount,
        pixKeyType: withdrawKeyType,
        pixKeyValue: withdrawKeyValue,
      }),
    onSuccess: (data) => {
      toast({
        title: 'Saque solicitado',
        description: `Saque de ${formatBrl(data.amountBrl)} em processamento.`,
      });
      setWithdrawAmount('');
      setWithdrawKeyValue('');
      setIsWithdrawDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao sacar', description: error.message, variant: 'destructive' });
    },
  });

  const { mutate: createCryptoDeposit } = useMutation({
    mutationFn: () => apiClient.createCryptoDepositAddress({ asset: cryptoAsset, chain: cryptoChain }),
    onSuccess: (data) => {
      toast({
        title: 'Endereço gerado',
        description: `${data.asset} em ${data.chain}: ${data.address}`,
      });
    },
    onError: (error) => {
      toast({ title: 'Erro ao gerar endereço', description: error.message, variant: 'destructive' });
    },
  });

  const { mutate: createCryptoWithdrawal, isPending: isCryptoWithdrawing } = useMutation({
    mutationFn: () =>
      apiClient.createCryptoWithdrawal({
        amount: cryptoWithdrawalAmount,
        asset: cryptoAsset,
        chain: cryptoChain,
        address: cryptoAddress,
      }),
    onSuccess: (data) => {
      toast({
        title: 'Saque cripto enviado',
        description: `${data.amount} ${data.asset} para ${data.address}`,
      });
      setCryptoWithdrawalAmount('');
      setCryptoAddress('');
    },
    onError: (error) => {
      toast({ title: 'Erro ao sacar cripto', description: error.message, variant: 'destructive' });
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
                    {lastDeposit && (
                      <div className="rounded-lg border border-dashed border-border/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Depósito Pix gerado
                            </p>
                            <p className="font-semibold">{formatBrl(lastDeposit.amountBrl)}</p>
                            <p className="text-xs text-muted-foreground">
                              Expira em {new Date(lastDeposit.expiresAt).toLocaleTimeString('pt-BR')}
                            </p>
                            <p className="mt-2 text-[11px] font-mono leading-relaxed text-muted-foreground break-all">
                              {lastDeposit.qrCodeText}
                            </p>
                          </div>
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                            {lastDeposit.status}
                          </span>
                        </div>
                        {import.meta.env.DEV && (
                          <Button
                            variant="outline"
                            className="mt-3 w-full"
                            onClick={() => completeDeposit(lastDeposit.depositId)}
                            disabled={isCompletingDeposit}
                          >
                            {isCompletingDeposit ? 'Confirmando...' : 'Simular confirmação (DEV)'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Sacar Pix
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Saque via Pix</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Valor (R$)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="150.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de chave</Label>
                      <Select value={withdrawKeyType} onValueChange={(v) => setWithdrawKeyType(v as PixKeyType)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="evp">Chave aleatória (EVP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-key-value">Chave Pix</Label>
                      <Input
                        id="withdraw-key-value"
                        placeholder="Insira sua chave Pix"
                        value={withdrawKeyValue}
                        onChange={(e) => setWithdrawKeyValue(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => createWithdrawal()}
                      disabled={isWithdrawing || !withdrawAmount || !withdrawKeyValue}
                      className="w-full"
                    >
                      {isWithdrawing ? 'Solicitando...' : 'Solicitar saque'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {lastDeposit && (
            <div className="mt-4 max-w-md rounded-lg border border-dashed border-border/70 bg-card/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Depósito Pix</p>
                  <p className="font-semibold">{formatBrl(lastDeposit.amountBrl)}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-medium capitalize">{lastDeposit.status}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expira em {new Date(lastDeposit.expiresAt).toLocaleTimeString('pt-BR')}
                  </p>
                  <p className="mt-2 text-[11px] font-mono leading-relaxed text-muted-foreground break-all">
                    {lastDeposit.qrCodeText}
                  </p>
                </div>
              </div>
              {import.meta.env.DEV && (
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => completeDeposit(lastDeposit.depositId)}
                  disabled={isCompletingDeposit}
                >
                  {isCompletingDeposit ? 'Confirmando...' : 'Simular confirmação (DEV)'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transactions & Crypto */}
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

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="glass-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">Depósito cripto (mock)</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Ativo</Label>
                <Input value={cryptoAsset} onChange={(e) => setCryptoAsset(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Rede</Label>
                <Input value={cryptoChain} onChange={(e) => setCryptoChain(e.target.value)} />
              </div>
              <Button onClick={() => createCryptoDeposit()} className="w-full">
                Gerar endereço
              </Button>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">Saque cripto (mock)</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Valor</Label>
                <Input
                  value={cryptoWithdrawalAmount}
                  onChange={(e) => setCryptoWithdrawalAmount(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-1">
                <Label>Endereço</Label>
                <Input
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <Button
                onClick={() => createCryptoWithdrawal()}
                disabled={isCryptoWithdrawing || !cryptoWithdrawalAmount || !cryptoAddress}
                className="w-full"
              >
                {isCryptoWithdrawing ? 'Enviando...' : 'Solicitar saque'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
