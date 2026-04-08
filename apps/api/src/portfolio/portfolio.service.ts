import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioAssetDto, UpdatePortfolioAssetDto } from './dto/portfolio.dto';
import { decryptField } from '../utils/crypto.util';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const assets = await this.prisma.portfolioAsset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        wallet: { select: { name: true } },
        transaction: { select: { id: true } },
      },
    });
    return assets.map(a => this.serialize(a));
  }

  async findOne(id: string, userId: string) {
    const a = await this.prisma.portfolioAsset.findUnique({
      where: { id },
      include: {
        wallet: { select: { name: true } },
        transaction: { select: { id: true } },
      },
    });
    if (!a) throw new NotFoundException('Asset not found');
    if (a.userId !== userId) throw new ForbiddenException();
    return this.serialize(a);
  }

  async create(userId: string, dto: CreatePortfolioAssetDto) {
    const costBasis = BigInt(Math.round(dto.costBasis));
    const units = dto.units;
    const totalCost = BigInt(Math.round(Number(units) * Number(costBasis)));
    const purchaseDate = dto.purchaseDate ? new Date(dto.purchaseDate) : new Date();

    return this.prisma.$transaction(async (tx) => {
      let transactionId: string | undefined;

      // 1. If walletId provided, handle balance and audit trail
      if (dto.walletId) {
        const wallet = await tx.wallet.findUnique({ where: { id: dto.walletId } });
        if (!wallet || wallet.userId !== userId) {
          throw new ForbiddenException('Wallet not found or access denied');
        }
        if (wallet.balance < totalCost) {
          throw new BadRequestException('Số dư ví không đủ để mua tài sản này');
        }

        // Deduct from wallet
        await tx.wallet.update({
          where: { id: dto.walletId },
          data: { balance: { decrement: totalCost } },
        });

        // Create audit transaction
        const transaction = await tx.transaction.create({
          data: {
            userId,
            walletId: dto.walletId,
            type: 'INVESTMENT',
            amount: totalCost,
            originalAmount: totalCost,
            originalCurrency: wallet.currency || 'VND',
            category: 'Đầu tư',
            date: purchaseDate,
            notes: `Mua tài sản: ${dto.name} (${dto.units} đơn vị)`,
          },
        });
        transactionId = transaction.id;
      }

      // 2. Create the Portfolio Asset
      const a = await tx.portfolioAsset.create({
        data: {
          userId,
          name: dto.name,
          ticker: dto.ticker,
          assetType: dto.assetType,
          units: dto.units,
          costBasis: costBasis,
          currentPrice: BigInt(Math.round(dto.currentPrice)),
          currency: dto.currency || 'VND',
          purchaseDate: purchaseDate,
          notes: dto.notes,
          walletId: dto.walletId,
          transactionId: transactionId,
        },
        include: {
          wallet: { select: { name: true } },
          transaction: { select: { id: true } },
        },
      });

      return this.serialize(a);
    });
  }

  async update(id: string, userId: string, dto: UpdatePortfolioAssetDto) {
    await this.findOne(id, userId);
    const a = await this.prisma.portfolioAsset.update({
      where: { id },
      data: {
        name: dto.name,
        ticker: dto.ticker,
        assetType: dto.assetType,
        units: dto.units,
        costBasis: dto.costBasis !== undefined ? BigInt(Math.round(dto.costBasis)) : undefined,
        currentPrice: dto.currentPrice !== undefined ? BigInt(Math.round(dto.currentPrice)) : undefined,
        currency: dto.currency,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        notes: dto.notes,
      },
    });
    return this.serialize(a);
  }

  async remove(id: string, userId: string) {
    const asset = await this.prisma.portfolioAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    if (asset.userId !== userId) throw new ForbiddenException();

    return this.prisma.$transaction(async (tx) => {
      // If linked to a wallet, refund the cost basis
      if (asset.walletId) {
        const refundAmount = BigInt(Math.round(Number(asset.units) * Number(asset.costBasis)));
        await tx.wallet.update({
          where: { id: asset.walletId },
          data: { balance: { increment: refundAmount } },
        });

        // Delete the audit transaction as well
        if (asset.transactionId) {
          await tx.transaction.delete({ where: { id: asset.transactionId } });
        }
      }

      await tx.portfolioAsset.delete({ where: { id } });
      return { message: 'Asset deleted and balance refunded (if applicable)' };
    });
  }

  async getSummary(userId: string) {
    const assets = await this.prisma.portfolioAsset.findMany({ where: { userId } });
    let totalCost = 0;
    let totalValue = 0;
    for (const a of assets) {
      const units = Number(a.units);
      totalCost += Number(a.costBasis) * units;
      totalValue += Number(a.currentPrice) * units;
    }
    const pnl = totalValue - totalCost;
    const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    return { totalCost, totalValue, pnl, pnlPct, count: assets.length };
  }

  private serialize(a: any) {
    return {
      ...a,
      units: Number(a.units),
      costBasis: Number(a.costBasis),
      currentPrice: Number(a.currentPrice),
      walletName: a.wallet ? decryptField(a.wallet.name, a.userId) : null,
    };
  }
}
