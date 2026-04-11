import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringDto, UpdateRecurringDto } from './dto/recurring.dto';

@Injectable()
export class RecurringService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const items = await this.prisma.recurringItem.findMany({
      where: { userId },
      orderBy: { nextDate: 'asc' },
    });
    return items.map(this.serialize);
  }

  async findOne(id: string, userId: string) {
    const r = await this.prisma.recurringItem.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Recurring item not found');
    if (r.userId !== userId) throw new ForbiddenException();
    return this.serialize(r);
  }

  async create(userId: string, dto: CreateRecurringDto) {
    const r = await this.prisma.recurringItem.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        originalCurrency: dto.originalCurrency,
        category: dto.category,
        subCategory: dto.subCategory,
        interval: dto.interval,
        nextDate: new Date(dto.nextDate),
        notes: dto.notes,
      },
    });
    return this.serialize(r);
  }

  async update(id: string, userId: string, dto: UpdateRecurringDto) {
    await this.findOne(id, userId);
    const r = await this.prisma.recurringItem.update({
      where: { id },
      data: {
        type: dto.type,
        amount: dto.amount !== undefined ? dto.amount : undefined,
        originalCurrency: dto.originalCurrency,
        category: dto.category,
        subCategory: dto.subCategory,
        interval: dto.interval,
        nextDate: dto.nextDate ? new Date(dto.nextDate) : undefined,
        notes: dto.notes,
        active: dto.active,
      },
    });
    return this.serialize(r);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.recurringItem.delete({ where: { id } });
    return { message: 'Recurring item deleted' };
  }

  private serialize(r: any) {
    return { ...r, amount: Number(r.amount) };
  }
}
