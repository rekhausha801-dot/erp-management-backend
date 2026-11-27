import { PartialType } from '@nestjs/swagger';
import { CreateServiceCategoryDto } from './create-service.dto';

export class UpdateServiceCategoryDto extends PartialType(
  CreateServiceCategoryDto,
) {}
