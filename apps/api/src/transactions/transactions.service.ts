import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto, QueryTransactionDto } from './dto/transaction.dto';
import { Prisma } from '@prisma/client';
import { encryptNote, decryptNote } from '../utils/crypto.util';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryTransactionDto) {
    const {
      type, startDate, endDate, category, walletId,
      page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc',
    } = query;

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(type && { type }),
      ...(walletId && { walletId }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const rawData = await this.prisma.transaction.findMany({
      where,
      include: { 
        wallet: { select: { id: true, name: true } },
        savingsGoal: { select: { id: true, name: true } },
        savingsDeposit: { select: { id: true, bankName: true } },
      },
    });

    let processedData = rawData.map(t => this.serialize(t));

    if (category) {
      processedData = processedData.filter(t => t.category === category);
    }

    processedData.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = processedData.length;
    const startIndex = (page - 1) * limit;
    const pagedData = processedData.slice(startIndex, startIndex + limit);

    return {
      data: pagedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string) {
    const t = await this.prisma.transaction.findUnique({ 
      where: { id },
      include: {
        wallet: { select: { id: true, name: true } },
        savingsGoal: { select: { id: true, name: true } },
        savingsDeposit: { select: { id: true, bankName: true } },
      }
    });
    if (!t) throw new NotFoundException('Transaction not found');
    if (t.userId !== userId) throw new ForbiddenException();
    return this.serialize(t);
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const amount = BigInt(Math.round(dto.amount));
    
    return await this.prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          userId,
          type: dto.type,
          amount,
          originalAmount: BigInt(Math.round(dto.originalAmount)),
          originalCurrency: dto.originalCurrency,
          category: encryptNote(dto.category, userId) || '',
          subCategory: encryptNote(dto.subCategory, userId) || null,
          date: new Date(dto.date),
          notes: encryptNote(dto.notes, userId) || null,
          walletId: dto.walletId ?? null,
          recurringId: dto.recurringId ?? null,
          goalId: dto.goalId ?? null,
          savingsDepositId: dto.savingsDepositId ?? null,
        },
        include: {
          wallet: { select: { id: true, name: true } },
          savingsGoal: { select: { id: true, name: true } },
          savingsDeposit: { select: { id: true, bankName: true } },
        },
      });

      // 1. Update wallet balance
      if (dto.walletId) {
        const typeUpper = dto.type?.toString().toUpperCase();
        // In this system: INCOME increases balance, EXPENSE/SAVING/INVESTMENT decreases balance
        const isIncrement = typeUpper === 'INCOME';
        const wallet = await tx.wallet.findFirst({
          where: { id: dto.walletId, userId },
        });
        if (!wallet) {
          throw new NotFoundException('Ví không tồn tại');
        }

        // Strict Balance Check
        if (!isIncrement && wallet.balance < amount) {
          throw new BadRequestException(`Số dư ví không đủ (Hiện có: ${Number(wallet.balance).toLocaleString()} VND)`);
        }

        if (wallet) {
          await tx.wallet.update({
            where: { id: dto.walletId },
            data: { balance: { increment: isIncrement ? amount : -amount } },
          });
        }
      }

      // 2. Sync with SavingsGoal
      if (dto.type?.toString().toUpperCase() === 'SAVING' && dto.goalId) {
        const goal = await tx.savingsGoal.findFirst({
          where: { id: dto.goalId, userId },
        });
        if (goal) {
          await tx.savingsGoal.update({
            where: { id: dto.goalId },
            data: { currentAmount: { increment: amount } },
          });
        }
      }

      // 3. Sync with SavingsDeposit
      if (dto.type?.toString().toUpperCase() === 'SAVING' && dto.savingsDepositId) {
        const deposit = await tx.savingsDeposit.findFirst({
          where: { id: dto.savingsDepositId, userId },
        });
        if (deposit) {
          await tx.savingsDeposit.update({
            where: { id: dto.savingsDepositId },
            data: { depositAmount: { increment: amount } },
          });
        }
      }

      // 4. Sync with Portfolio (Investment)
      if (dto.type?.toString().toUpperCase() === 'INVESTMENT' && dto.ticker) {
        const units = dto.units || 1;
        const cbPerUnit = BigInt(Math.round(Number(amount) / units));
        
        await tx.portfolioAsset.create({
          data: {
            userId,
            name: dto.ticker, // Default to ticker as name
            ticker: dto.ticker,
            assetType: dto.assetType || 'STOCK',
            units: units,
            costBasis: cbPerUnit,
            currentPrice: dto.currentPrice ? BigInt(Math.round(dto.currentPrice)) : cbPerUnit,
            purchaseDate: new Date(dto.date),
            walletId: dto.walletId,
            transactionId: t.id,
          }
        });
      }

      return this.serialize(t);
    });
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const oldT = await this.prisma.transaction.findUnique({ where: { id } });
    if (!oldT) throw new NotFoundException('Transaction not found');
    if (oldT.userId !== userId) throw new ForbiddenException();

    const newAmount = dto.amount !== undefined ? BigInt(Math.round(dto.amount)) : oldT.amount;
    const newType = dto.type || oldT.type;
    const newWalletId = dto.walletId !== undefined ? dto.walletId : oldT.walletId;
    const newGoalId = dto.goalId !== undefined ? dto.goalId : oldT.goalId;
    const newDepositId = dto.savingsDepositId !== undefined ? dto.savingsDepositId : oldT.savingsDepositId;

    const [t] = await this.prisma.$transaction(async (tx) => {
      // 1. Revert old wallet balance
      if (oldT.walletId) {
        const oldIsIncrement = oldT.type === 'INCOME';
        await tx.wallet.update({
          where: { id: oldT.walletId },
          data: { balance: { increment: oldIsIncrement ? -oldT.amount : oldT.amount } },
        });
      }

      // 2. Revert old SavingsGoal contribution
      if (oldT.type === 'SAVING' && oldT.goalId) {
        await tx.savingsGoal.update({
          where: { id: oldT.goalId },
          data: { currentAmount: { decrement: oldT.amount } },
        });
      }

      // 3. Revert old SavingsDeposit contribution
      if (oldT.type === 'SAVING' && oldT.savingsDepositId) {
        await tx.savingsDeposit.update({
          where: { id: oldT.savingsDepositId },
          data: { depositAmount: { decrement: oldT.amount } },
        });
      }

      // 3. Update transaction
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          type: dto.type,
          amount: dto.amount !== undefined ? BigInt(Math.round(dto.amount)) : undefined,
          originalAmount: dto.originalAmount !== undefined ? BigInt(Math.round(dto.originalAmount)) : undefined,
          originalCurrency: dto.originalCurrency,
          category: dto.category !== undefined ? (encryptNote(dto.category, userId) || '') : undefined,
          subCategory: dto.subCategory !== undefined ? (encryptNote(dto.subCategory, userId) || null) : undefined,
          date: dto.date ? new Date(dto.date) : undefined,
          notes: dto.notes !== undefined ? (encryptNote(dto.notes, userId) || null) : undefined,
          walletId: dto.walletId !== undefined ? dto.walletId : undefined,
          goalId: dto.goalId !== undefined ? dto.goalId : undefined,
          savingsDepositId: dto.savingsDepositId !== undefined ? dto.savingsDepositId : undefined,
        },
        include: {
          wallet: { select: { id: true, name: true } },
          savingsGoal: { select: { id: true, name: true } },
          savingsDeposit: { select: { id: true, bankName: true } },
        },
      });

      // 4. Apply new wallet balance
      if (newWalletId) {
        const newIsIncrement = newType === 'INCOME';
        await tx.wallet.update({
          where: { id: newWalletId },
          data: { balance: { increment: newIsIncrement ? newAmount : -newAmount } },
        });
      }

      // 5. Apply new SavingsGoal contribution
      if (newType === 'SAVING' && newGoalId) {
        await tx.savingsGoal.update({
          where: { id: newGoalId },
          data: { currentAmount: { increment: newAmount } },
        });
      }

      // 6. Apply new SavingsDeposit contribution
      if (newType === 'SAVING' && newDepositId) {
        await tx.savingsDeposit.update({
          where: { id: newDepositId },
          data: { depositAmount: { increment: newAmount } },
        });
      }

      return [updated];
    });

    return this.serialize(t);
  }

  async remove(id: string, userId: string) {
    const t = await this.prisma.transaction.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Transaction not found');
    if (t.userId !== userId) throw new ForbiddenException();

    return await this.prisma.$transaction(async (tx) => {
      // 1. Revert wallet balance
      if (t.walletId) {
        const isIncrement = t.type === 'INCOME';
        await tx.wallet.update({
          where: { id: t.walletId },
          data: { balance: { increment: isIncrement ? -t.amount : t.amount } },
        });
      }

      // 2. Revert SavingsGoal contribution
      if (t.type === 'SAVING' && t.goalId) {
        await tx.savingsGoal.update({
          where: { id: t.goalId },
          data: { currentAmount: { decrement: t.amount } },
        });
      }

      // 3. Revert SavingsDeposit contribution
      if (t.type === 'SAVING' && t.savingsDepositId) {
        await tx.savingsDeposit.update({
          where: { id: t.savingsDepositId },
          data: { depositAmount: { decrement: t.amount } },
        });
      }

      // 4. Revert PortfolioAsset (Investment)
      if (t.type === 'INVESTMENT') {
        await tx.portfolioAsset.deleteMany({
          where: { transactionId: t.id },
        });
      }

      await tx.transaction.delete({ where: { id } });
      return { message: 'Transaction deleted' };
    });
  }

  async getSummary(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      select: { type: true, amount: true },
    });

    const summary = { income: 0, expense: 0, saving: 0, investment: 0 };
    for (const t of transactions) {
      const key = t.type.toLowerCase() as keyof typeof summary;
      if (summary.hasOwnProperty(key)) {
        summary[key] += Number(t.amount);
      }
    }
    return { year, month, ...summary, net: summary.income - summary.expense - summary.saving - summary.investment };
  }

  private serialize(t: any) {
    return {
      ...t,
      category: decryptNote(t.category, t.userId),
      subCategory: decryptNote(t.subCategory, t.userId),
      notes: decryptNote(t.notes, t.userId),
      amount: Number(t.amount),
      originalAmount: Number(t.originalAmount),
      walletName: t.wallet ? decryptNote(t.wallet.name, t.userId) : null,
      goalName: t.savingsGoal ? t.savingsGoal.name : null,
      depositBankName: t.savingsDeposit ? decryptNote(t.savingsDeposit.bankName, t.userId) : null,
    };
  }
}
