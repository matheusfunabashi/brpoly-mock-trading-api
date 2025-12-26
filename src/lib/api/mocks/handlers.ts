import { http, HttpResponse } from 'msw';
import type {
  Market,
  User,
  Order,
  Trade,
  Position,
  Balance,
  OrderbookSnapshot,
  PaginatedMarkets,
  PaginatedOrders,
  PaginatedTrades,
  PositionsResponse,
  AuthResponse,
  PixDeposit,
  PixWithdrawal,
  CryptoDeposit,
  CryptoWithdrawal,
} from '../types';

// Mock data
const mockUser: User = {
  id: 'user_001',
  email: 'maria@example.com',
  fullName: 'Maria Silva',
  role: 'customer',
  kycStatus: 'approved',
  createdAt: '2024-01-15T10:30:00Z',
};

const mockMarkets: Market[] = [
  {
    id: 'market_lula_2026',
    title: 'Lula será reeleito em 2026?',
    description: 'Este mercado resolve para SIM se Luiz Inácio Lula da Silva vencer a eleição presidencial de 2026.',
    category: 'Política',
    status: 'open',
    closeTime: '2026-10-01T23:59:59Z',
    outcomes: [
      { id: 'yes', title: 'Sim' },
      { id: 'no', title: 'Não' },
    ],
    currentPrices: [
      { outcomeId: 'yes', price: '0.42' },
      { outcomeId: 'no', price: '0.58' },
    ],
    volumeBrl: '2450000.00',
  },
  {
    id: 'market_selic_2025',
    title: 'Selic abaixo de 10% até dezembro 2025?',
    description: 'Resolve para SIM se a taxa Selic estiver abaixo de 10% ao ano na última reunião do Copom de 2025.',
    category: 'Economia',
    status: 'open',
    closeTime: '2025-12-15T23:59:59Z',
    outcomes: [
      { id: 'yes', title: 'Sim' },
      { id: 'no', title: 'Não' },
    ],
    currentPrices: [
      { outcomeId: 'yes', price: '0.23' },
      { outcomeId: 'no', price: '0.77' },
    ],
    volumeBrl: '890000.00',
  },
  {
    id: 'market_flamengo_liberta',
    title: 'Flamengo vence a Libertadores 2025?',
    description: 'Este mercado resolve para SIM se o Flamengo vencer a Copa Libertadores da América 2025.',
    category: 'Esportes',
    status: 'open',
    closeTime: '2025-11-30T23:59:59Z',
    outcomes: [
      { id: 'yes', title: 'Sim' },
      { id: 'no', title: 'Não' },
    ],
    currentPrices: [
      { outcomeId: 'yes', price: '0.18' },
      { outcomeId: 'no', price: '0.82' },
    ],
    volumeBrl: '1250000.00',
  },
  {
    id: 'market_dolar_6',
    title: 'Dólar acima de R$6,50 em março 2025?',
    description: 'Resolve para SIM se a cotação do dólar comercial ultrapassar R$6,50 em qualquer momento de março de 2025.',
    category: 'Economia',
    status: 'open',
    closeTime: '2025-03-31T23:59:59Z',
    outcomes: [
      { id: 'yes', title: 'Sim' },
      { id: 'no', title: 'Não' },
    ],
    currentPrices: [
      { outcomeId: 'yes', price: '0.65' },
      { outcomeId: 'no', price: '0.35' },
    ],
    volumeBrl: '3200000.00',
  },
  {
    id: 'market_bbb_camila',
    title: 'Camila vence o BBB 25?',
    description: 'Este mercado resolve para SIM se a participante Camila vencer o Big Brother Brasil 2025.',
    category: 'Entretenimento',
    status: 'open',
    closeTime: '2025-04-22T23:59:59Z',
    outcomes: [
      { id: 'yes', title: 'Sim' },
      { id: 'no', title: 'Não' },
    ],
    currentPrices: [
      { outcomeId: 'yes', price: '0.31' },
      { outcomeId: 'no', price: '0.69' },
    ],
    volumeBrl: '780000.00',
  },
  {
    id: 'market_spacex_mars',
    title: 'SpaceX pousa humanos em Marte até 2030?',
    description: 'Resolve para SIM se a SpaceX realizar um pouso tripulado em Marte antes de 31/12/2030.',
    category: 'Tecnologia',
    status: 'open',
    closeTime: '2030-12-31T23:59:59Z',
    outcomes: [
      { id: 'yes', title: 'Sim' },
      { id: 'no', title: 'Não' },
    ],
    currentPrices: [
      { outcomeId: 'yes', price: '0.08' },
      { outcomeId: 'no', price: '0.92' },
    ],
    volumeBrl: '560000.00',
  },
];

const mockOrders: Order[] = [
  {
    id: 'order_001',
    marketId: 'market_lula_2026',
    outcomeId: 'yes',
    side: 'buy',
    type: 'limit',
    price: '0.40',
    amount: '500',
    filledAmount: '250',
    status: 'partial',
    createdAt: '2024-12-20T14:30:00Z',
  },
  {
    id: 'order_002',
    marketId: 'market_selic_2025',
    outcomeId: 'no',
    side: 'buy',
    type: 'limit',
    price: '0.75',
    amount: '200',
    filledAmount: '200',
    status: 'filled',
    createdAt: '2024-12-19T10:15:00Z',
  },
];

const mockTrades: Trade[] = [
  {
    id: 'trade_001',
    marketId: 'market_lula_2026',
    outcomeId: 'yes',
    price: '0.42',
    amount: '150',
    takerSide: 'buy',
    createdAt: '2024-12-25T08:30:00Z',
  },
  {
    id: 'trade_002',
    marketId: 'market_lula_2026',
    outcomeId: 'yes',
    price: '0.41',
    amount: '300',
    takerSide: 'sell',
    createdAt: '2024-12-25T08:25:00Z',
  },
  {
    id: 'trade_003',
    marketId: 'market_lula_2026',
    outcomeId: 'no',
    price: '0.59',
    amount: '200',
    takerSide: 'buy',
    createdAt: '2024-12-25T08:20:00Z',
  },
];

const mockPositions: Position[] = [
  {
    marketId: 'market_lula_2026',
    outcomeId: 'yes',
    size: '500',
    avgPrice: '0.38',
    pnlBrl: '20.00',
    lastPrice: '0.42',
  },
  {
    marketId: 'market_selic_2025',
    outcomeId: 'no',
    size: '200',
    avgPrice: '0.75',
    pnlBrl: '4.00',
    lastPrice: '0.77',
  },
  {
    marketId: 'market_dolar_6',
    outcomeId: 'yes',
    size: '100',
    avgPrice: '0.70',
    pnlBrl: '-5.00',
    lastPrice: '0.65',
  },
];

const mockBalance: Balance = {
  brlAvailable: '1250.50',
  brlReserved: '200.00',
  totalBrl: '1450.50',
  updatedAt: '2024-12-25T10:00:00Z',
};

const mockOrderbook: OrderbookSnapshot = {
  bids: [
    { price: '0.40', amount: '500' },
    { price: '0.39', amount: '800' },
    { price: '0.38', amount: '1200' },
    { price: '0.37', amount: '600' },
    { price: '0.35', amount: '900' },
  ],
  asks: [
    { price: '0.42', amount: '450' },
    { price: '0.43', amount: '700' },
    { price: '0.44', amount: '550' },
    { price: '0.45', amount: '1100' },
    { price: '0.48', amount: '800' },
  ],
};

const mockCryptoDeposit: CryptoDeposit = {
  depositId: 'crypto_dep_1',
  address: '0xabc123',
  asset: 'USDC',
  chain: 'polygon',
  status: 'pending',
  confirmations: 0,
};

const mockCryptoWithdrawal: CryptoWithdrawal = {
  withdrawalId: 'crypto_with_1',
  status: 'pending',
  amount: '50',
  asset: 'USDC',
  chain: 'polygon',
  address: '0xabc123',
};

export const handlers = [
  // Auth
  http.post('/auth/register', async ({ request }) => {
    const body = await request.json() as { email: string; fullName: string };
    const response: AuthResponse = {
      user: { ...mockUser, email: body.email, fullName: body.fullName },
      token: 'mock_jwt_token_' + Date.now(),
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.post('/auth/login', async () => {
    const response: AuthResponse = {
      user: mockUser,
      token: 'mock_jwt_token_' + Date.now(),
    };
    return HttpResponse.json(response);
  }),

  http.get('/auth/me', () => {
    return HttpResponse.json(mockUser);
  }),

  http.post('/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Markets
  http.get('/markets', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const q = url.searchParams.get('q');

    let filteredMarkets = [...mockMarkets];

    if (category) {
      filteredMarkets = filteredMarkets.filter(m => m.category === category);
    }

    if (q) {
      const query = q.toLowerCase();
      filteredMarkets = filteredMarkets.filter(
        m => m.title.toLowerCase().includes(query) || m.description.toLowerCase().includes(query)
      );
    }

    const response: PaginatedMarkets = {
      items: filteredMarkets,
      nextCursor: null,
    };
    return HttpResponse.json(response);
  }),

  http.get('/markets/:marketId', ({ params }) => {
    const market = mockMarkets.find(m => m.id === params.marketId);
    if (!market) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Market not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json(market);
  }),

  http.get('/markets/:marketId/orderbook', () => {
    return HttpResponse.json(mockOrderbook);
  }),

  http.get('/markets/:marketId/trades', () => {
    const response: PaginatedTrades = {
      items: mockTrades,
      nextCursor: null,
    };
    return HttpResponse.json(response);
  }),

  // Orders
  http.post('/orders', async ({ request }) => {
    const body = await request.json() as { marketId: string; outcomeId: string; side: string; type: string; price?: string; amount: string };
    const order: Order = {
      id: 'order_' + Date.now(),
      marketId: body.marketId,
      outcomeId: body.outcomeId,
      side: body.side as 'buy' | 'sell',
      type: body.type as 'limit' | 'market',
      price: body.price,
      amount: body.amount,
      filledAmount: '0',
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(order, { status: 201 });
  }),

  http.get('/orders', () => {
    const response: PaginatedOrders = {
      items: mockOrders,
      nextCursor: null,
    };
    return HttpResponse.json(response);
  }),

  http.post('/orders/:orderId/cancel', ({ params }) => {
    const order = mockOrders.find(o => o.id === params.orderId);
    if (!order) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ ...order, status: 'canceled' });
  }),

  // Positions
  http.get('/positions', () => {
    const response: PositionsResponse = {
      items: mockPositions,
    };
    return HttpResponse.json(response);
  }),

  // Wallet
  http.get('/wallet/balance', () => {
    return HttpResponse.json(mockBalance);
  }),

  http.post('/wallet/deposits/pix/create', async ({ request }) => {
    const body = await request.json() as { amountBrl: string };
    const payload: PixDeposit = {
      depositId: 'dep_' + Date.now(),
      status: 'pending',
      qrCodeText: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000',
      qrCodeImageUrl: 'https://via.placeholder.com/200',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      amountBrl: body.amountBrl,
    };
    return HttpResponse.json(payload, { status: 201 });
  }),

  http.get('/wallet/deposits/pix/:depositId', ({ params }) => {
    const payload: PixDeposit = {
      depositId: params.depositId as string,
      status: 'completed',
      qrCodeText: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000',
      qrCodeImageUrl: 'https://via.placeholder.com/200',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      amountBrl: '200.00',
    };
    return HttpResponse.json(payload);
  }),

  http.post('/wallet/withdrawals/pix/create', async ({ request }) => {
    const body = await request.json() as { amountBrl: string; pixKeyType: string; pixKeyValue: string };
    const payload: PixWithdrawal = {
      withdrawalId: 'with_' + Date.now(),
      status: 'processing',
      createdAt: new Date().toISOString(),
      amountBrl: body.amountBrl,
      pixKeyType: body.pixKeyType as PixWithdrawal['pixKeyType'],
      pixKeyValue: body.pixKeyValue,
    };
    return HttpResponse.json(payload, { status: 201 });
  }),

  http.post('/wallet/deposits/crypto/createAddress', async ({ request }) => {
    const body = await request.json() as { asset: string; chain: string };
    const payload: CryptoDeposit = {
      ...mockCryptoDeposit,
      asset: body.asset,
      chain: body.chain,
      depositId: 'crypto_dep_' + Date.now(),
    };
    return HttpResponse.json(payload, { status: 201 });
  }),

  http.get('/wallet/deposits/crypto/:depositId', ({ params }) => {
    const payload: CryptoDeposit = {
      ...mockCryptoDeposit,
      depositId: params.depositId as string,
      status: 'confirmed',
      confirmations: 20,
    };
    return HttpResponse.json(payload);
  }),

  http.post('/wallet/withdrawals/crypto/create', async ({ request }) => {
    const body = await request.json() as { amount: string; asset: string; chain: string; address: string };
    const payload: CryptoWithdrawal = {
      ...mockCryptoWithdrawal,
      withdrawalId: 'crypto_with_' + Date.now(),
      amount: body.amount,
      asset: body.asset,
      chain: body.chain,
      address: body.address,
      status: 'processing',
    };
    return HttpResponse.json(payload, { status: 201 });
  }),

  // KYC
  http.post('/kyc/start', () => {
    return HttpResponse.json({
      kycCaseId: 'kyc_' + Date.now(),
      provider: 'mock-provider',
      status: 'pending',
      redirectUrl: 'https://kyc.example.com/verify',
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.get('/kyc/status', () => {
    return HttpResponse.json({
      status: 'pending',
      updatedAt: new Date().toISOString(),
      reason: 'Verificação de identidade em andamento',
    });
  }),

  // Health
  http.get('/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
