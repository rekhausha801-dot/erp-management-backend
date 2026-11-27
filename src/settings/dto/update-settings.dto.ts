import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '₹' })
  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @ApiPropertyOptional({ example: 'DD/MM/YYYY' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  fiscalYearStart?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsNumber()
  defaultTaxRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quotationPrefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salesOrderPrefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purchaseOrderPrefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceRequestPrefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workOrderPrefix?: string;
}
