import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioAssetDto, UpdatePortfolioAssetDto } from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const assets = await this.prisma.portfolioAsset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return assets.map(this.serialize);
  }

  async findOne(id: string, userId: string) {
    const a = await this.prisma.portfolioAsset.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Asset not found');
    if (a.userId !== userId) throw new ForbiddenException();
    return this.serialize(a);
  }

  async create(userId: string, dto: CreatePortfolioAssetDto) {
    const a = await this.prisma.portfolioAsset.create({
      data: {
        userId,
        name: dto.name,
        ticker: dto.ticker,
        assetType: dto.assetType,
        units: dto.units,
        costBasis: BigInt(Math.round(dto.costBasis)),
        currentPrice: BigInt(Math.round(dto.currentPrice)),
        currency: dto.currency || 'VND',
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        notes: dto.notes,
      },
    });
    return this.serialize(a);
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
    await this.findOne(id, userId);
    await this.prisma.portfolioAsset.delete({ where: { id } });
    return { message: 'Asset deleted' };
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
    };
  }
}
