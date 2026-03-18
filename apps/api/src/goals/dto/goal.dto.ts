import { IsString, IsNumber, IsOptional, IsPositive, IsDateString, IsHexColor } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  targetAmount: number;

  @IsNumber()
  @IsOptional()
  currentAmount?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}

export class UpdateGoalDto extends CreateGoalDto {}

export class ContributeToGoalDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
