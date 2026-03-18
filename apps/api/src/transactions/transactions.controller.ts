import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards, Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, QueryTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() query: QueryTransactionDto, @Request() req) {
    return this.transactionsService.findAll(req.user.id, query);
  }

  @Get('summary')
  getSummary(@Query('year') year: string, @Query('month') month: string, @Request() req) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    return this.transactionsService.getSummary(req.user.id, y, m);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateTransactionDto, @Request() req) {
    return this.transactionsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto, @Request() req) {
    return this.transactionsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.transactionsService.remove(id, req.user.id);
  }
}
