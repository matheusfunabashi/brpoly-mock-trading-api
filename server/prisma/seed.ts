import { PrismaClient, Role, MarketStatus, OrderSide, OrderType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type OutcomeKey = "yes" | "no";

function outcomeId(marketId: string, key: OutcomeKey) {
  return `${marketId}_${key}`;
}

async function main() {
  const passwordHash = await bcrypt.hash("Pass123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: {
      email: "maria@example.com",
      password: passwordHash,
      fullName: "Maria Silva",
      role: Role.customer,
    },
  });

  await prisma.walletBalance.upsert({
    where: { userId: user.id },
    update: {
      brlAvailable: 1250.5,
      brlReserved: 200.0,
      totalBrl: 1450.5,
    },
    create: {
      userId: user.id,
      brlAvailable: 1250.5,
      brlReserved: 200.0,
      totalBrl: 1450.5,
    },
  });

  // Clear tables in dependency order (avoid FK issues)
  await prisma.trade.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.position.deleteMany({});
  await prisma.marketPrice.deleteMany({});
  await prisma.outcome.deleteMany({});
  await prisma.market.deleteMany({});

  const markets = await prisma.$transaction(async (tx) => {
    const createMarket = async (data: {
      id: string;
      title: string;
      description: string;
      category: string;
      status: MarketStatus;
      closeTime: Date;
      volumeBrl: number;
      outcomes: { key: OutcomeKey; title: string }[];
      prices: { key: OutcomeKey; price: number }[];
    }) => {
      const market = await tx.market.create({
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          closeTime: data.closeTime,
          volumeBrl: data.volumeBrl,
        },
      });

      // Create outcomes with unique IDs per market
      for (const o of data.outcomes) {
        await tx.outcome.create({
          data: {
            id: outcomeId(market.id, o.key),
            title: o.title,
            marketId: market.id,
          },
        });
      }

      // Create prices referencing the unique outcome IDs
      for (const p of data.prices) {
        await tx.marketPrice.create({
          data: {
            marketId: market.id,
            outcomeId: outcomeId(market.id, p.key),
            price: p.price,
          },
        });
      }

      return market;
    };

    const marketA = await createMarket({
      id: "market_lula_2026",
      title: "Lula será reeleito em 2026?",
      description:
        "Resolve para SIM se Luiz Inácio Lula da Silva vencer a eleição presidencial de 2026.",
      category: "Política",
      status: MarketStatus.open,
      closeTime: new Date("2026-10-01T23:59:59Z"),
      volumeBrl: 2450000.0,
      outcomes: [
        { key: "yes", title: "Sim" },
        { key: "no", title: "Não" },
      ],
      prices: [
        { key: "yes", price: 0.42 },
        { key: "no", price: 0.58 },
      ],
    });

    const marketB = await createMarket({
      id: "market_selic_2025",
      title: "Selic abaixo de 10% até dezembro 2025?",
      description:
        "Resolve para SIM se a taxa Selic estiver abaixo de 10% ao ano na última reunião do Copom de 2025.",
      category: "Economia",
      status: MarketStatus.open,
      closeTime: new Date("2025-12-15T23:59:59Z"),
      volumeBrl: 890000.0,
      outcomes: [
        { key: "yes", title: "Sim" },
        { key: "no", title: "Não" },
      ],
      prices: [
        { key: "yes", price: 0.23 },
        { key: "no", price: 0.77 },
      ],
    });

    const marketC = await createMarket({
      id: "market_dolar_6",
      title: "Dólar acima de R$6,50 em março 2025?",
      description:
        "Resolve para SIM se a cotação do dólar comercial ultrapassar R$6,50 em qualquer momento de março de 2025.",
      category: "Economia",
      status: MarketStatus.open,
      closeTime: new Date("2025-03-31T23:59:59Z"),
      volumeBrl: 3200000.0,
      outcomes: [
        { key: "yes", title: "Sim" },
        { key: "no", title: "Não" },
      ],
      prices: [
        { key: "yes", price: 0.65 },
        { key: "no", price: 0.35 },
      ],
    });

    return [marketA, marketB, marketC] as const;
  });

  const [marketA, marketB, marketC] = markets;

  // Trades using unique outcome IDs
  const trades = [
    {
      marketId: marketA.id,
      outcomeId: outcomeId(marketA.id, "yes"),
      price: 0.42,
      amount: 150,
      takerSide: OrderSide.buy,
    },
    {
      marketId: marketA.id,
      outcomeId: outcomeId(marketA.id, "yes"),
      price: 0.41,
      amount: 300,
      takerSide: OrderSide.sell,
    },
    {
      marketId: marketA.id,
      outcomeId: outcomeId(marketA.id, "no"),
      price: 0.59,
      amount: 200,
      takerSide: OrderSide.buy,
    },
  ];

  for (const trade of trades) {
    await prisma.trade.create({
      data: {
        ...trade,
        takerUserId: user.id,
      },
    });
  }

  // Orders using unique outcome IDs
  const orders = [
    {
      id: "order_001",
      marketId: marketA.id,
      outcomeId: outcomeId(marketA.id, "yes"),
      side: OrderSide.buy,
      type: OrderType.limit,
      price: 0.4,
      amount: 500,
      filledAmount: 250,
      status: "partial" as const,
    },
    {
      id: "order_002",
      marketId: marketB.id,
      outcomeId: outcomeId(marketB.id, "no"),
      side: OrderSide.buy,
      type: OrderType.limit,
      price: 0.75,
      amount: 200,
      filledAmount: 200,
      status: "filled" as const,
    },
  ];

  for (const order of orders) {
    await prisma.order.create({
      data: {
        id: order.id,
        userId: user.id,
        marketId: order.marketId,
        outcomeId: order.outcomeId,
        side: order.side,
        type: order.type,
        price: order.price,
        amount: order.amount,
        filledAmount: order.filledAmount,
        status: order.status,
      },
    });
  }

  // Positions using unique outcome IDs
  const positions = [
    {
      marketId: marketA.id,
      outcomeId: outcomeId(marketA.id, "yes"),
      size: 500,
      avgPrice: 0.38,
      pnlBrl: 20.0,
      lastPrice: 0.42,
    },
    {
      marketId: marketB.id,
      outcomeId: outcomeId(marketB.id, "no"),
      size: 200,
      avgPrice: 0.75,
      pnlBrl: 4.0,
      lastPrice: 0.77,
    },
    {
      marketId: marketC.id,
      outcomeId: outcomeId(marketC.id, "yes"),
      size: 100,
      avgPrice: 0.7,
      pnlBrl: -5.0,
      lastPrice: 0.65,
    },
  ];

  for (const position of positions) {
    await prisma.position.create({
      data: {
        ...position,
        userId: user.id,
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
