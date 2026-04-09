import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketDataType } from '@prisma/client';

@Controller('market-data')
@UseGuards(JwtAuthGuard)
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get()
  async findAll() {
    return this.marketDataService.findAll();
  }

  @Get('favorites')
  async getFavorites(@Req() req: any) {
    const userId = req.user.id;
    return this.marketDataService.getFavorites(userId);
  }

  @Post('refresh')
  async refresh() {
    return this.marketDataService.refresh();
  }

  @Post('preferences/toggle')
  async togglePreference(
    @Req() req: any,
    @Body() body: { symbol: string; type: MarketDataType; label?: string },
  ) {
    const userId = req.user.id;
    return this.marketDataService.togglePreference(userId, body.symbol, body.type);
  }
}
