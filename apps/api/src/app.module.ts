import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { GoalsModule } from './goals/goals.module';
import { RecurringModule } from './recurring/recurring.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SavingsDepositsModule } from './savings-deposits/savings-deposits.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    PortfolioModule,
    GoalsModule,
    RecurringModule,
    AnalyticsModule,
    SavingsDepositsModule,
  ],
})
export class AppModule {}
