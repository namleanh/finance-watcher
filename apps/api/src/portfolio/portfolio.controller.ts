import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioAssetDto, UpdatePortfolioAssetDto } from './dto/portfolio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  findAll(@Request() req) {
    return this.portfolioService.findAll(req.user.id);
  }

  @Get('summary')
  getSummary(@Request() req) {
    return this.portfolioService.getSummary(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.portfolioService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreatePortfolioAssetDto, @Request() req) {
    return this.portfolioService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePortfolioAssetDto, @Request() req) {
    return this.portfolioService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.portfolioService.remove(id, req.user.id);
  }
}
