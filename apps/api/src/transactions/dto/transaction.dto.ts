import {
  IsEnum, IsNumber, IsOptional, IsString,
  IsDateString, IsPositive, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetType } from '@prisma/client';

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

  @IsString()
  @IsOptional()
  goalId?: string;

  @IsString()
  @IsOptional()
  savingsDepositId?: string;

  // Investment fields
  @IsString()
  @IsOptional()
  ticker?: string;

  @IsNumber()
  @IsOptional()
  units?: number;

  @IsEnum(AssetType)
  @IsOptional()
  assetType?: AssetType;

  @IsNumber()
  @IsOptional()
  currentPrice?: number;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  originalAmount?: number;

  @IsOptional()
  @IsString()
  originalCurrency?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  subCategory?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  walletId?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  recurringId?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  goalId?: string;

  @IsString()
  @IsOptional()
  savingsDepositId?: string;

  // Investment fields
  @IsOptional()
  @IsString()
  ticker?: string;

  @IsOptional()
  @IsNumber()
  units?: number;

  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;
}

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
