import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SavingsDepositsService } from './savings-deposits.service';
import { CreateSavingsDepositDto, UpdateSavingsDepositDto } from './dto/savings-deposit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('savings-deposits')
export class SavingsDepositsController {
  constructor(private readonly service: SavingsDepositsService) {}

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateSavingsDepositDto, @Request() req) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSavingsDepositDto, @Request() req) {
    return this.service.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.id);
  }

  @Patch(':id/withdraw')
  withdraw(
    @Param('id') id: string, 
    @Body('destinationWalletId') destinationWalletId: string, 
    @Request() req
  ) {
    return this.service.withdraw(id, req.user.id, destinationWalletId);
  }
}
