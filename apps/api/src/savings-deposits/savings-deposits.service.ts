import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsDepositDto, UpdateSavingsDepositDto } from './dto/savings-deposit.dto';
import { encryptField, decryptField, generateBlindIndex } from '../utils/crypto.util';
import { toVND } from '../utils/exchange.util';

@Injectable()
export class SavingsDepositsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const deposits = await this.prisma.savingsDeposit.findMany({
      where: { userId },
      orderBy: { depositDate: 'desc' },
      include: {
        wallet: { select: { id: true, name: true } },
        transactions: { select: { id: true } },
      },
    });
    return deposits.map(d => this.serialize(d));
  }

  async findOne(id: string, userId: string) {
    const d = await this.prisma.savingsDeposit.findUnique({
      where: { id },
      include: {
        wallet: { select: { id: true, name: true } },
        transactions: { select: { id: true } },
      },
    });
    if (!d) throw new NotFoundException('Savings deposit not found');
    if (d.userId !== userId) throw new ForbiddenException();
    return this.serialize(d);
  }

  async create(userId: string, dto: CreateSavingsDepositDto) {
    const depositAmount = dto.depositAmount;
    const depositDate = new Date(dto.depositDate);
    const maturityDate = new Date(depositDate);
    maturityDate.setMonth(maturityDate.getMonth() + dto.termMonths);

    return this.prisma.$transaction(async (tx) => {
      let walletCurrency = 'VND';
      let currentRate = 1;

      // 1. If walletId provided, handle balance and determine currency
      if (dto.walletId) {
        const wallet = await tx.wallet.findUnique({ where: { id: dto.walletId } });
        if (!wallet || wallet.userId !== userId) {
          throw new ForbiddenException('Wallet not found or access denied');
        }
        if (wallet.balance.lt(depositAmount)) {
          throw new BadRequestException('Số dư ví không đủ để thực hiện khoản tiết kiệm này');
        }
        walletCurrency = wallet.currency || 'VND';

        // Fetch live rate for conversion if not VND
        if (walletCurrency !== 'VND') {
          const marketData = await tx.marketData.findUnique({
            where: { type_symbol: { type: 'CURRENCY', symbol: walletCurrency } }
          });
          currentRate = marketData ? Number(marketData.price) : toVND(1, walletCurrency);
        }

        // Deduct from wallet
        await tx.wallet.update({
          where: { id: dto.walletId },
          data: { balance: { decrement: depositAmount } },
        });

        // The audit transaction will be created after the deposit is created
      }

      // 2. Create the Savings Deposit
      const deposit = await tx.savingsDeposit.create({
        data: {
          userId,
          bankName: encryptField(dto.bankName, userId) || dto.bankName,
          bankNameHash: generateBlindIndex(dto.bankName),
          depositAmount,
          termMonths: dto.termMonths,
          interestRate: dto.interestRate,
          depositDate,
          maturityDate,
          currency: walletCurrency,
          notes: dto.notes,
          walletId: dto.walletId,
        },
      });

      // 3. Create audit transaction linked to the new deposit
      if (dto.walletId) {
        await tx.transaction.create({
          data: {
            userId,
            walletId: dto.walletId,
            type: 'SAVING',
            amount: Number(depositAmount) * currentRate,
            originalAmount: depositAmount,
            originalCurrency: walletCurrency,
            category: encryptField('Tiết kiệm', userId) || 'Tiết kiệm',
            date: new Date(),
            notes: encryptField(`Gửi tiết kiệm: ${dto.bankName}`, userId) || `Gửi tiết kiệm: ${dto.bankName}`,
            savingsDepositId: deposit.id,
          },
        });
      }

      // Re-fetch with relations for serialization
      const finalDeposit = await tx.savingsDeposit.findUnique({
        where: { id: deposit.id },
        include: {
          wallet: { select: { id: true, name: true } },
          transactions: { select: { id: true } },
        },
      });

      return this.serialize(finalDeposit);
    });
  }

  async update(id: string, userId: string, dto: UpdateSavingsDepositDto) {
    await this.findOne(id, userId);
    const deposit = await this.prisma.savingsDeposit.update({
      where: { id },
      data: {
        bankName: dto.bankName ? encryptField(dto.bankName, userId) : undefined,
        bankNameHash: dto.bankName ? generateBlindIndex(dto.bankName) : undefined,
        depositAmount: dto.depositAmount !== undefined ? dto.depositAmount : undefined,
        termMonths: dto.termMonths,
        interestRate: dto.interestRate,
        depositDate: dto.depositDate ? new Date(dto.depositDate) : undefined,
        status: dto.status,
        notes: dto.notes,
        walletId: dto.walletId,
      },
    });
    return this.serialize(deposit);
  }

  async remove(id: string, userId: string) {
    const deposit = await this.prisma.savingsDeposit.findUnique({ where: { id } });
    if (!deposit) throw new NotFoundException('Savings deposit not found');
    if (deposit.userId !== userId) throw new ForbiddenException();

    return this.prisma.$transaction(async (tx) => {
      // If linked to a wallet, refund the balance (only if ACTIVE - mistake correction)
      if (deposit.walletId && deposit.status === 'ACTIVE') {
        await tx.wallet.update({
          where: { id: deposit.walletId },
          data: { balance: { increment: deposit.depositAmount } },
        });

        // Delete all linked transactions for this deposit
        await tx.transaction.deleteMany({
          where: { savingsDepositId: id },
        });
      }

      await tx.savingsDeposit.delete({ where: { id } });
      return { message: 'Savings deposit deleted and related transactions handled' };
    });
  }

  async withdraw(id: string, userId: string, destinationWalletId?: string) {
    const d = await this.prisma.savingsDeposit.findUnique({
      where: { id },
      include: { wallet: true },
    });
    if (!d) throw new NotFoundException('Savings deposit not found');
    if (d.userId !== userId) throw new ForbiddenException();
    if (d.status === 'WITHDRAWN') throw new BadRequestException('Sổ tiết kiệm này đã được tất toán');

    const targetWalletId = destinationWalletId || d.walletId;
    if (!targetWalletId) {
      throw new BadRequestException('Vui lòng chọn ví nhận tiền để tất toán sổ này (do ví gốc đã bị xóa hoặc chưa được thiết lập)');
    }

    // Verify target wallet exists and belongs to user
    const targetWallet = await this.prisma.wallet.findUnique({ where: { id: targetWalletId } });
    if (!targetWallet || targetWallet.userId !== userId) {
      throw new ForbiddenException('Ví nhận tiền không tồn tại hoặc không thuộc quyền sở hữu của bạn');
    }

    // Calculate interest - only if maturity date has been reached
    const depositAmount = Number(d.depositAmount);
    const interestRate = Number(d.interestRate);
    const termMonths = d.termMonths;
    const isMatured = new Date() >= new Date(d.maturityDate);
    const interestEarned = isMatured
      ? Math.round(depositAmount * (interestRate / 100) * (termMonths / 12))
      : 0;
    const totalRefund = depositAmount + interestEarned;

    return this.prisma.$transaction(async (tx) => {
      // 0. Verify currency matching
      if (targetWallet.currency !== d.currency) {
        throw new BadRequestException(`Tiền tệ của ví nhận tiền (${targetWallet.currency}) không khớp với đơn vị tiền tệ của sổ tiết kiệm (${d.currency}). Vui lòng chọn ví phù hợp.`);
      }

      // 1. Update wallet balance
      await tx.wallet.update({
        where: { id: targetWalletId },
        data: { balance: { increment: totalRefund } },
      });

      // 2. Create an INCOME transaction for the interest (only if matured)
      if (isMatured && interestEarned > 0) {
        await tx.transaction.create({
          data: {
            userId,
            walletId: targetWalletId,
            type: 'INCOME',
            amount: interestEarned,
            originalAmount: interestEarned,
            originalCurrency: d.currency || 'VND',
            category: encryptField('Lãi tiết kiệm', userId) || 'Lãi tiết kiệm',
            date: new Date(),
            notes: encryptField(`Tất toán sổ: ${decryptField(d.bankName, userId)}`, userId) || `Tất toán sổ: ${decryptField(d.bankName, userId)}`,
            savingsDepositId: id,
          },
        });
      }

      // 3. Update deposit status
      const updated = await tx.savingsDeposit.update({
        where: { id },
        data: { status: 'WITHDRAWN' },
        include: {
          wallet: { select: { id: true, name: true, currency: true } },
          transactions: { select: { id: true } },
        },
      });

      return this.serialize(updated);
    });
  }

  private serialize(d: any) {
    const depositAmount = Number(d.depositAmount);
    const interestRate = Number(d.interestRate);
    const termMonths = d.termMonths;
    const interestEarned = Math.round(depositAmount * (interestRate / 100) * (termMonths / 12));

    return {
      ...d,
      bankName: decryptField(d.bankName, d.userId),
      depositAmount,
      interestRate,
      interestEarned,
      currency: d.currency || 'VND',
      walletName: d.wallet ? decryptField(d.wallet.name, d.userId) : null,
      walletCurrency: d.wallet?.currency || 'VND',
      transactionIds: d.transactions ? d.transactions.map((t: any) => t.id) : [],
    };
  }
}
