import { PartialType } from '@nestjs/swagger';
import { CreateLeadDto, CreateSalesDto } from './create-sales.dto';

export class UpdateSalesDto extends PartialType(CreateSalesDto) {}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}
