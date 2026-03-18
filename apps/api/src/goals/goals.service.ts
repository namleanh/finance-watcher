import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto, ContributeToGoalDto } from './dto/goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return goals.map(this.serialize);
  }

  async findOne(id: string, userId: string) {
    const g = await this.prisma.savingsGoal.findUnique({ where: { id } });
    if (!g) throw new NotFoundException('Goal not found');
    if (g.userId !== userId) throw new ForbiddenException();
    return this.serialize(g);
  }

  async create(userId: string, dto: CreateGoalDto) {
    const g = await this.prisma.savingsGoal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: BigInt(Math.round(dto.targetAmount)),
        currentAmount: dto.currentAmount ? BigInt(Math.round(dto.currentAmount)) : BigInt(0),
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        color: dto.color,
        icon: dto.icon,
      },
    });
    return this.serialize(g);
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    await this.findOne(id, userId);
    const g = await this.prisma.savingsGoal.update({
      where: { id },
      data: {
        name: dto.name,
        targetAmount: dto.targetAmount !== undefined ? BigInt(Math.round(dto.targetAmount)) : undefined,
        currentAmount: dto.currentAmount !== undefined ? BigInt(Math.round(dto.currentAmount)) : undefined,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        color: dto.color,
        icon: dto.icon,
      },
    });
    return this.serialize(g);
  }

  async contribute(id: string, userId: string, dto: ContributeToGoalDto) {
    const goal = await this.findOne(id, userId);
    const newAmount = goal.currentAmount + dto.amount;
    const g = await this.prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: BigInt(Math.round(newAmount)),
        ...(newAmount >= goal.targetAmount ? { status: 'COMPLETED' } : {}),
      },
    });
    return this.serialize(g);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.savingsGoal.delete({ where: { id } });
    return { message: 'Goal deleted' };
  }

  private serialize(g: any) {
    return {
      ...g,
      targetAmount: Number(g.targetAmount),
      currentAmount: Number(g.currentAmount),
      progress: g.targetAmount > 0
        ? Math.min((Number(g.currentAmount) / Number(g.targetAmount)) * 100, 100)
        : 0,
    };
  }
}
