import { useState } from 'react';
import { MarketList } from '@/components/markets/MarketList';
import { CategoryTabs } from '@/components/markets/CategoryTabs';
import { StatusTabs, type StatusFilter } from '@/components/markets/StatusTabs';
import { SortSelect, type SortOption } from '@/components/markets/SortSelect';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Users, DollarSign } from 'lucide-react';

const Index = () => {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('volume');
  const [status, setStatus] = useState<StatusFilter>('open');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-fade-in">
              Negocie o{' '}
              <span className="text-primary">futuro do Brasil</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: '100ms' }}>
              Mercados de previsão sobre política, economia, esportes e mais.
              Aposte no que você acredita.
            </p>

            {/* Search */}
            <div className="relative mx-auto max-w-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar mercados..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-12 text-base"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 md:mx-auto md:max-w-2xl animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono">R$ 12M+</p>
              <p className="text-sm text-muted-foreground">Volume total</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono">48</p>
              <p className="text-sm text-muted-foreground">Mercados ativos</p>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono">5.2K</p>
              <p className="text-sm text-muted-foreground">Traders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="container py-12">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold">Explorar mercados</h2>
            <div className="flex items-center gap-4">
              <StatusTabs selected={status} onChange={setStatus} />
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>
          <CategoryTabs selected={category} onChange={setCategory} />
        </div>

        <MarketList category={category} search={search} sort={sort} status={status} />
      </section>
    </div>
  );
};

export default Index;
