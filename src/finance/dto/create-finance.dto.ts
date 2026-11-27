import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'Cash in Hand' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'ASSET', description: 'ASSET | LIABILITY | EQUITY | INCOME | EXPENSE' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
