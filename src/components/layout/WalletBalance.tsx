import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatBrl } from '@/lib/format';
import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export function WalletBalance() {
  const { data: balance, isLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => apiClient.getBalance(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <Link
      to="/wallet"
      className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 transition-colors hover:bg-secondary/80"
    >
      <Wallet className="h-4 w-4 text-primary" />
      <span className="font-mono text-sm font-medium">
        {balance ? formatBrl(balance.brlAvailable) : 'R$ 0,00'}
      </span>
    </Link>
  );
}
