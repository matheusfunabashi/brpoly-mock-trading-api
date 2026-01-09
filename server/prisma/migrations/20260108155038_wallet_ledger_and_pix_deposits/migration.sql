-- CreateEnum
CREATE TYPE "PixDepositStatus" AS ENUM ('pending', 'completed', 'expired', 'failed');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('PIX_DEPOSIT_CREDIT');

-- CreateTable
CREATE TABLE "PixDeposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountBrl" DECIMAL(18,2) NOT NULL,
    "status" "PixDepositStatus" NOT NULL DEFAULT 'pending',
    "qrCodeText" TEXT NOT NULL,
    "qrCodeImageUrl" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PixDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amountBrl" DECIMAL(18,2) NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_referenceType_referenceId_key" ON "WalletTransaction"("referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "PixDeposit" ADD CONSTRAINT "PixDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
