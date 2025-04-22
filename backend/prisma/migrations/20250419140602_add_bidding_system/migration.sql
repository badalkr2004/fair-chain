/*
  Warnings:

  - You are about to drop the column `status` on the `SupplyChain` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `SupplyChainLink` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `SupplyChainLink` table. All the data in the column will be lost.
  - You are about to drop the column `fromLocation` on the `SupplyChainLink` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `SupplyChainLink` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `SupplyChainLink` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `SupplyChainLink` table. All the data in the column will be lost.
  - You are about to drop the column `toLocation` on the `SupplyChainLink` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDetails` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `profitSplit` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `fromUserId` to the `SupplyChainLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toUserId` to the `SupplyChainLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `SupplyChainLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "ProductStatus" ADD VALUE 'PROCESSING';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionStatus" ADD VALUE 'PAID';
ALTER TYPE "TransactionStatus" ADD VALUE 'DELIVERED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'PURCHASE';
ALTER TYPE "TransactionType" ADD VALUE 'SALE';
ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';

-- DropForeignKey
ALTER TABLE "SupplyChainLink" DROP CONSTRAINT "SupplyChainLink_serviceProviderId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropIndex
DROP INDEX "Transaction_transactionId_key";

-- AlterTable
ALTER TABLE "SupplyChain" DROP COLUMN "status",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SupplyChainLink" DROP COLUMN "cost",
DROP COLUMN "endTime",
DROP COLUMN "fromLocation",
DROP COLUMN "serviceType",
DROP COLUMN "startTime",
DROP COLUMN "status",
DROP COLUMN "toLocation",
ADD COLUMN     "carbonFootprint" DOUBLE PRECISION,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "details" JSONB,
ADD COLUMN     "fromUserId" TEXT NOT NULL,
ADD COLUMN     "location" JSONB,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "toUserId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "serviceProviderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "paymentDetails",
DROP COLUMN "profitSplit",
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "quantity" DOUBLE PRECISION,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT,
ALTER COLUMN "transactionId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "intermediaryId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "terms" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "responseReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_intermediaryId_fkey" FOREIGN KEY ("intermediaryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainLink" ADD CONSTRAINT "SupplyChainLink_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "IntermediaryProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
