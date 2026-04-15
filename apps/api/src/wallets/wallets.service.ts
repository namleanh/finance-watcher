import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto, UpdateWalletDto } from './dto/wallet.dto';
import { encryptField, decryptField, generateBlindIndex } from '../utils/crypto.util';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return wallets.map(w => this.serialize(w));
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { id } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.userId !== userId) throw new ForbiddenException();
    return this.serialize(wallet);
  }

  async create(userId: string, dto: CreateWalletDto) {
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        name: encryptField(dto.name, userId) || dto.name,
        nameHash: generateBlindIndex(dto.name),
        type: dto.type,
        balance: dto.balance !== undefined ? dto.balance : 0,
        currency: dto.currency || 'VND',
        color: dto.color,
        icon: dto.icon,
      },
    });
    return this.serialize(wallet);
  }

  async update(id: string, userId: string, dto: UpdateWalletDto) {
    await this.findOne(id, userId);
    const wallet = await this.prisma.wallet.update({
      where: { id },
      data: {
        name: dto.name ? encryptField(dto.name, userId) : undefined,
        nameHash: dto.name ? generateBlindIndex(dto.name) : undefined,
        type: dto.type,
        balance: dto.balance !== undefined ? dto.balance : undefined,
        currency: dto.currency,
        color: dto.color,
        icon: dto.icon,
      },
    });
    return this.serialize(wallet);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    // Check for active dependencies
    const [activeSavings, activeAssets] = await Promise.all([
      this.prisma.savingsDeposit.count({
        where: { walletId: id, status: 'ACTIVE' }
      }),
      this.prisma.portfolioAsset.count({
        where: { walletId: id }
      })
    ]);

    if (activeSavings > 0 || activeAssets > 0) {
      throw new BadRequestException(
        `Không thể xóa ví này vì đang có ${activeSavings} khoản tiết kiệm và ${activeAssets} tài sản đầu tư đang liên kết. Vui lòng chuyển hoặc xóa chúng trước.`
      );
    }

    await this.prisma.wallet.delete({ where: { id } });
    return { message: 'Wallet deleted' };
  }

  /** BigInt → number for JSON serialization */
  private serialize(w: any) {
    return {
      ...w,
      name: decryptField(w.name, w.userId),
      balance: Number(w.balance),
    };
  }
}
