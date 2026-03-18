import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsPositive, IsDateString } from 'class-validator';
import { TransactionTypeEnum } from '../../transactions/dto/transaction.dto';

export enum RecurringIntervalEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateRecurringDto {
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  originalCurrency: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  subCategory?: string;

  @IsEnum(RecurringIntervalEnum)
  interval: RecurringIntervalEnum;

  @IsDateString()
  nextDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateRecurringDto extends CreateRecurringDto {
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
