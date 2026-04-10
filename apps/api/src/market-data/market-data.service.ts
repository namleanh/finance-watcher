import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketDataType } from '@prisma/client';

@Injectable()
export class MarketDataService implements OnModuleInit {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureInitialData();
    await this.refresh();
  }

  private async ensureInitialData() {
    const requiredItems = [
      { symbol: 'SJC_BUY', label: 'Vàng SJC (Mua)', type: MarketDataType.GOLD },
      { symbol: 'SJC_SELL', label: 'Vàng SJC (Bán)', type: MarketDataType.GOLD },
      { symbol: 'RING_BUY', label: 'Vàng Nhẫn 9999 (Mua)', type: MarketDataType.GOLD },
      { symbol: 'RING_SELL', label: 'Vàng Nhẫn 9999 (Bán)', type: MarketDataType.GOLD },
      { symbol: 'USD', label: 'Đô la Mỹ', type: MarketDataType.CURRENCY },
    ];

    for (const item of requiredItems) {
      await this.prisma.marketData.upsert({
        where: { type_symbol: { type: item.type, symbol: item.symbol } },
        update: { label: item.label },
        create: { ...item, price: 0 },
      });
    }

    // Only clean up non-GOLD/CURRENCY data (like old stocks) to preserve added currencies
    await this.prisma.marketData.deleteMany({
      where: { 
        type: { notIn: [MarketDataType.GOLD, MarketDataType.CURRENCY] } 
      }
    });
  }

  async findAll() {
    return this.prisma.marketData.findMany({
      orderBy: [{ type: 'asc' }, { symbol: 'asc' }],
    });
  }

  async getFavorites(userId: string) {
    const preferences = await this.prisma.userMarketPreference.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }, // Newest additions at the end
    });

    const marketData = await this.findAll();

    const preferredSymbols = preferences.map(p => p.symbol);
    
    // Return only user preferences in order of creation
    return preferredSymbols.map(sym => 
      marketData.find(item => item.symbol === sym)
    ).filter(Boolean);
  }

  async togglePreference(userId: string, symbol: string, type: MarketDataType) {
    const existing = await this.prisma.userMarketPreference.findUnique({
      where: { userId_symbol_type: { userId, symbol, type } },
    });

    if (existing) {
      await this.prisma.userMarketPreference.delete({
        where: { id: existing.id },
      });
      return { status: 'removed' };
    } else {
      // Ensure the symbol exists in MarketData table first (with placeholder price)
      await this.prisma.marketData.upsert({
        where: { type_symbol: { type, symbol } },
        update: {},
        create: { type, symbol, label: symbol, price: 0 },
      });

      await this.prisma.userMarketPreference.create({
        data: { userId, symbol, type },
      });

      // Trigger immediate refresh for this new item
      await this.refresh();
      return { status: 'added' };
    }
  }

  async refresh() {
    this.logger.log('Refreshing Gold and Forex data...');
    try {
      await Promise.all([
        this.refreshGold(),
        this.refreshForex(),
      ]);
      return this.findAll();
    } catch (error) {
      this.logger.error('Failed to refresh market data', error);
      throw error;
    }
  }

  private async refreshGold() {
    try {
      const response = await fetch('https://gw.vnexpress.net/th?types=gia_vang_v2');
      const json = await response.json();
      const goldData = json.data?.gia_vang_v2;

      if (!goldData) {
        throw new Error('Invalid gold data response structure');
      }

      const parsePrice = (val: string) => {
        // VnExpress uses dot as thousand separator and comma as decimal
        // e.g., "169,7" or "4.762,2"
        const normalized = val.replace(/\./g, '').replace(',', '.');
        return parseFloat(normalized) * 1_000_000;
      };

      if (goldData.sjc) {
        await this.updatePrice('SJC_BUY', MarketDataType.GOLD, parsePrice(goldData.sjc.buy));
        await this.updatePrice('SJC_SELL', MarketDataType.GOLD, parsePrice(goldData.sjc.sell));
      }

      if (goldData.vangnhan9999) {
        await this.updatePrice('RING_BUY', MarketDataType.GOLD, parsePrice(goldData.vangnhan9999.buy));
        await this.updatePrice('RING_SELL', MarketDataType.GOLD, parsePrice(goldData.vangnhan9999.sell));
      }
      
      this.logger.log('Gold prices updated from VnExpress');
    } catch (error) {
      this.logger.error('Gold refresh failed', error);
    }
  }

  private async refreshForex() {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/VND');
      const data = await response.json();
      const rates = data.rates;

      // Fetch all distinct currency symbols currently being tracked
      const allMarkets = await this.prisma.marketData.findMany({
        where: { type: MarketDataType.CURRENCY }
      });

      for (const market of allMarkets) {
        if (rates[market.symbol]) {
          await this.updatePrice(market.symbol, MarketDataType.CURRENCY, 1 / rates[market.symbol]);
        }
      }
    } catch (error) {
      this.logger.error('Forex refresh failed', error);
    }
  }

  private async updatePrice(symbol: string, type: MarketDataType, price: number) {
    await this.prisma.marketData.update({
      where: { type_symbol: { type, symbol } },
      data: { price, updatedAt: new Date() },
    });
  }
}
