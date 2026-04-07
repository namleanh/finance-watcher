import { IsString, IsEnum, IsOptional, Min } from 'class-validator';

export enum WalletTypeEnum {
  CASH = 'CASH',
  BANK = 'BANK',
  E_WALLET = 'E_WALLET',
  CREDIT = 'CREDIT',
}

export class CreateWalletDto {
  @IsString()
  name: string;

  @IsEnum(WalletTypeEnum)
  @IsOptional()
  type?: WalletTypeEnum;

  @IsOptional()
  @Min(0)
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}

export class UpdateWalletDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(WalletTypeEnum)
  @IsOptional()
  type?: WalletTypeEnum;

  @IsOptional()
  @Min(0)
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
