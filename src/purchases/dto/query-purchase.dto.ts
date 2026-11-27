import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryPurchaseDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;
}
