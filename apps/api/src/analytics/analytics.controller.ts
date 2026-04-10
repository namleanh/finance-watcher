import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.analyticsService.getDashboard(req.user.id);
  }

  @Get('net-worth')
  getNetWorthHistory(@Query('year') year: string, @Request() req) {
    const y = parseInt(year) || new Date().getFullYear();
    return this.analyticsService.getNetWorthHistory(req.user.id, y);
  }

  @Get('spending')
  getSpendingByCategory(
    @Query('year') year: string,
    @Query('month') month: string,
    @Request() req,
  ) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    return this.analyticsService.getSpendingByCategory(req.user.id, y, m);
  }

  @Get('cashflow')
  getCashflowTrend(@Query('range') range: '1D' | '1W' | '1M' | '1Y', @Request() req) {
    return this.analyticsService.getCashflowTrend(req.user.id, range || '1M');
  }
}
