import { IsString, IsNumber, IsOptional, IsEnum, IsPositive, IsDateString } from 'class-validator';

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
  @IsPositive()
  units: number;

  @IsNumber()
  @IsPositive()
  costBasis: number; // per unit, in base currency

  @IsNumber()
  @IsPositive()
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
}

export class UpdatePortfolioAssetDto extends CreatePortfolioAssetDto {}
