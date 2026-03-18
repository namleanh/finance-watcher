import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto, ContributeToGoalDto } from './dto/goal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(@Request() req) {
    return this.goalsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.goalsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateGoalDto, @Request() req) {
    return this.goalsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGoalDto, @Request() req) {
    return this.goalsService.update(id, req.user.id, dto);
  }

  @Post(':id/contribute')
  contribute(@Param('id') id: string, @Body() dto: ContributeToGoalDto, @Request() req) {
    return this.goalsService.contribute(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.goalsService.remove(id, req.user.id);
  }
}
