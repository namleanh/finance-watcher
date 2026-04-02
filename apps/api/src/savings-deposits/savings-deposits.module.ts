import { Module } from '@nestjs/common';
import { SavingsDepositsController } from './savings-deposits.controller';
import { SavingsDepositsService } from './savings-deposits.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavingsDepositsController],
  providers: [SavingsDepositsService],
})
export class SavingsDepositsModule {}
