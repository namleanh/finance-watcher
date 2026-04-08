import { IsString, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateSavingsDepositDto {
  @IsString()
  bankName: string;

  @IsNumber()
  @Min(1)
  depositAmount: number;

  @IsNumber()
  termMonths: number; // 1, 3, 6, 12, 18, 24

  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number; // % per year

  @IsDateString()
  depositDate: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  walletId?: string;
}

export class UpdateSavingsDepositDto {
  @IsString()
  @IsOptional()
  bankName?: string;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsNumber()
  @IsOptional()
  termMonths?: number;

  @IsNumber()
  @IsOptional()
  interestRate?: number;

  @IsDateString()
  @IsOptional()
  depositDate?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  walletId?: string;
}
