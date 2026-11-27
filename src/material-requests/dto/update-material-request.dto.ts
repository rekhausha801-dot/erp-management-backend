import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateMaterialRequestDto } from './create-material-request.dto';

export class UpdateMaterialRequestDto extends PartialType(
  CreateMaterialRequestDto,
) {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
