import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to database on startup:', error.message);
      // We don't rethrow here to allow the NestJS app to at least bootstrap 
      // and provide CORS headers/diagnostic info
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
