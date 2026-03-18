import {
  IsEnum, IsNumber, IsOptional, IsString,
  IsDateString, IsPositive, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SAVING = 'SAVING',
  INVESTMENT = 'INVESTMENT',
}


export class CreateTransactionDto {
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @IsNumber()
  @IsPositive()
  amount: number; // in base currency

  @IsNumber()
  @IsPositive()
  originalAmount: number;

  @IsString()
  originalCurrency: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  subCategory?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  walletId?: string;

  @IsString()
  @IsOptional()
  recurringId?: string;
}

export class UpdateTransactionDto extends CreateTransactionDto {}

export class QueryTransactionDto {
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  walletId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'date';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
