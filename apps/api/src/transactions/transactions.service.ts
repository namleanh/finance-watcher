import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto, QueryTransactionDto } from './dto/transaction.dto';
import { Prisma } from '@prisma/client';

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
      ...(category && { category }),
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

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: { wallet: { select: { id: true, name: true } } },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: data.map(this.serialize),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string) {
    const t = await this.prisma.transaction.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Transaction not found');
    if (t.userId !== userId) throw new ForbiddenException();
    return this.serialize(t);
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const t = await this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: BigInt(Math.round(dto.amount)),
        originalAmount: BigInt(Math.round(dto.originalAmount)),
        originalCurrency: dto.originalCurrency,
        category: dto.category,
        subCategory: dto.subCategory,
        date: new Date(dto.date),
        notes: dto.notes,
        walletId: dto.walletId ?? null,
        recurringId: dto.recurringId ?? null,
      },
    });
    return this.serialize(t);
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    await this.findOne(id, userId);
    const t = await this.prisma.transaction.update({
      where: { id },
      data: {
        type: dto.type,
        amount: dto.amount !== undefined ? BigInt(Math.round(dto.amount)) : undefined,
        originalAmount: dto.originalAmount !== undefined ? BigInt(Math.round(dto.originalAmount)) : undefined,
        originalCurrency: dto.originalCurrency,
        category: dto.category,
        subCategory: dto.subCategory,
        date: dto.date ? new Date(dto.date) : undefined,
        notes: dto.notes,
        walletId: dto.walletId ?? null,
      },
    });
    return this.serialize(t);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Transaction deleted' };
  }

  /** Monthly summary (income / expense / saving / investment totals) */
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
      summary[key] += Number(t.amount);
    }
    return { year, month, ...summary, net: summary.income - summary.expense };
  }

  /** BigInt → number for JSON serialization */
  private serialize(t: any) {
    return {
      ...t,
      amount: Number(t.amount),
      originalAmount: Number(t.originalAmount),
    };
  }
}
