import { IsString, IsNumber, IsOptional, IsEnum, IsPositive, IsDateString, Min } from 'class-validator';

export enum AssetTypeEnum {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  REAL_ESTATE = 'REAL_ESTATE',
  GOLD = 'GOLD',
  OTHER = 'OTHER',
}

export class CreatePortfolioAssetDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  ticker?: string;

  @IsEnum(AssetTypeEnum)
  @IsOptional()
  assetType?: AssetTypeEnum;

  @IsNumber()
  @Min(0)
  units: number;

  @IsNumber()
  @Min(0)
  costBasis: number; // per unit, in base currency

  @IsNumber()
  @Min(0)
  currentPrice: number; // per unit, in base currency

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  walletId?: string;
}

export class UpdatePortfolioAssetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  ticker?: string;

  @IsEnum(AssetTypeEnum)
  @IsOptional()
  assetType?: AssetTypeEnum;

  @IsNumber()
  @IsOptional()
  @Min(0)
  units?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costBasis?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  currentPrice?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  walletId?: string;
}
