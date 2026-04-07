import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsDepositDto, UpdateSavingsDepositDto } from './dto/savings-deposit.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { encryptField, decryptField, generateBlindIndex } from '../utils/crypto.util';

@Injectable()
export class SavingsDepositsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const deposits = await this.prisma.savingsDeposit.findMany({
      where: { userId },
      orderBy: { depositDate: 'desc' },
    });
    return deposits.map(d => this.serialize(d));
  }

  async findOne(id: string, userId: string) {
    const d = await this.prisma.savingsDeposit.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Savings deposit not found');
    if (d.userId !== userId) throw new ForbiddenException();
    return this.serialize(d);
  }

  async create(userId: string, dto: CreateSavingsDepositDto) {
    const depositDate = new Date(dto.depositDate);
    const maturityDate = new Date(depositDate);
    maturityDate.setMonth(maturityDate.getMonth() + dto.termMonths);

    const deposit = await this.prisma.savingsDeposit.create({
      data: {
        userId,
        bankName: encryptField(dto.bankName, userId) || dto.bankName,
        bankNameHash: generateBlindIndex(dto.bankName),
        depositAmount: BigInt(Math.round(dto.depositAmount)),
        termMonths: dto.termMonths,
        interestRate: dto.interestRate,
        depositDate,
        maturityDate,
        notes: dto.notes,
      },
    });
    return this.serialize(deposit);
  }

  async update(id: string, userId: string, dto: UpdateSavingsDepositDto) {
    await this.findOne(id, userId);
    const deposit = await this.prisma.savingsDeposit.update({
      where: { id },
      data: {
        bankName: dto.bankName ? encryptField(dto.bankName, userId) : undefined,
        bankNameHash: dto.bankName ? generateBlindIndex(dto.bankName) : undefined,
        depositAmount: dto.depositAmount !== undefined ? BigInt(Math.round(dto.depositAmount)) : undefined,
        termMonths: dto.termMonths,
        interestRate: dto.interestRate,
        depositDate: dto.depositDate ? new Date(dto.depositDate) : undefined,
        status: dto.status,
        notes: dto.notes,
      },
    });
    return this.serialize(deposit);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.savingsDeposit.delete({ where: { id } });
    return { message: 'Savings deposit deleted' };
  }

  private serialize(d: any) {
    const depositAmount = Number(d.depositAmount);
    const interestRate = Number(d.interestRate);
    const termMonths = d.termMonths;
    // Interest = principal × rate × time(years)
    const interestEarned = Math.round(depositAmount * (interestRate / 100) * (termMonths / 12));

    return {
      ...d,
      bankName: decryptField(d.bankName, d.userId),
      depositAmount,
      interestRate,
      interestEarned,
    };
  }
}
