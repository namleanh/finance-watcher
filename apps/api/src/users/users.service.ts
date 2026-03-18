import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true, baseCurrency: true, createdAt: true },
    });
  }

  updateBaseCurrency(id: string, baseCurrency: string) {
    return this.prisma.user.update({
      where: { id },
      data: { baseCurrency },
      select: { id: true, email: true, displayName: true, baseCurrency: true },
    });
  }
}
