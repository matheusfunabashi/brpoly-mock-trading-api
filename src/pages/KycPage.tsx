import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock, XCircle, AlertCircle, User, FileText, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { KycStatus } from '@/lib/api/types';

const statusCopy: Record<KycStatus, { title: string; description: string; icon: JSX.Element; tone: string }> = {
  not_started: {
    title: 'KYC não iniciado',
    description: 'Confirme sua identidade para começar a negociar.',
    icon: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
    tone: '',
  },
  pending: {
    title: 'Em análise',
    description: 'Seu envio está em análise. Normalmente leva poucos minutos.',
    icon: <Clock className="h-5 w-5 text-primary" />,
    tone: 'text-primary',
  },
  manual_review: {
    title: 'Revisão manual',
    description: 'Nossa equipe precisa validar algumas informações adicionais.',
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    tone: 'text-amber-500',
  },
  approved: {
    title: 'Aprovado',
    description: 'Identidade verificada com sucesso.',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    tone: 'text-emerald-500',
  },
  rejected: {
    title: 'Recusado',
    description: 'Não foi possível verificar seus dados. Tente reenviar.',
    icon: <XCircle className="h-5 w-5 text-destructive" />,
    tone: 'text-destructive',
  },
};

const steps = [
  { key: 'not_started', label: 'Início', icon: User },
  { key: 'pending', label: 'Análise', icon: FileText },
  { key: 'approved', label: 'Aprovado', icon: ShieldCheck },
];

function getStepIndex(status: KycStatus): number {
  if (status === 'not_started') return 0;
  if (status === 'pending' || status === 'manual_review') return 1;
  if (status === 'approved') return 2;
  if (status === 'rejected') return 1;
  return 0;
}

export default function KycPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => apiClient.getKycStatus(),
  });

  const startKyc = useMutation({
    mutationFn: () => apiClient.startKyc(),
    onSuccess: (resp) => {
      toast({
        title: 'KYC iniciado',
        description: resp.redirectUrl
          ? 'Abra o link de verificação para continuar.'
          : 'Siga as instruções no app.',
      });
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao iniciar KYC', description: err.message, variant: 'destructive' });
    },
  });

  const currentStatus = data?.status ?? 'not_started';
  const copy = statusCopy[currentStatus] ?? statusCopy.not_started;

  const stepIndex = getStepIndex(currentStatus);

  return (
    <div className="min-h-screen pb-12">
      <div className="border-b border-border/50 bg-card/50">
        <div className="container py-8">
          <h1 className="mb-2 text-3xl font-bold">Verificação de identidade</h1>
          <p className="text-muted-foreground">Acompanhe o status do seu KYC.</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Stepper */}
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx <= stepIndex;
              const isCurrent = idx === stepIndex;
              const isRejected = currentStatus === 'rejected' && idx === 1;

              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                        isRejected
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted text-muted-foreground'
                      )}
                    >
                      {isRejected ? (
                        <XCircle className="h-5 w-5" />
                      ) : isCurrent && currentStatus === 'approved' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-xs font-medium',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 flex-1',
                        idx < stepIndex ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Card */}
        <Card className="max-w-2xl">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {copy.icon}
              <div>
                <CardTitle className={cn('text-lg', copy.tone)}>{copy.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
              </div>
            </div>
            {data?.updatedAt && (
              <div className="text-right text-xs text-muted-foreground">
                Atualizado em
                <br />
                {new Date(data.updatedAt).toLocaleString('pt-BR')}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <>
                {data?.reason && (
                  <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm">
                    <strong>Observação:</strong> {data.reason}
                  </div>
                )}
                {currentStatus !== 'approved' && (
                  <Button
                    onClick={() => startKyc.mutate()}
                    disabled={startKyc.isPending || currentStatus === 'pending'}
                  >
                    {startKyc.isPending
                      ? 'Iniciando...'
                      : currentStatus === 'rejected' || currentStatus === 'manual_review'
                      ? 'Tentar novamente'
                      : 'Iniciar verificação'}
                  </Button>
                )}
                {currentStatus === 'approved' && (
                  <div className="flex items-center gap-2 text-sm text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Você está verificado e pode negociar normalmente.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

